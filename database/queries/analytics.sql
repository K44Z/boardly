-- Analytics and Statistics

-- User Statistics
-- name: GetUserStats :one
SELECT 
    COUNT(DISTINCT b.id) as boards_owned,
    COUNT(DISTINCT m.board_id) as boards_member,
    COUNT(DISTINCT a.card_id) as cards_assigned,
    COUNT(DISTINCT c.id) as comments_made
FROM users u
LEFT JOIN boards b ON u.id = b.owner_id
LEFT JOIN memberships m ON u.id = m.user_id
LEFT JOIN assignments a ON u.id = a.user_id
LEFT JOIN comments c ON u.id = c.user_id
WHERE u.id = $1;

-- Board Statistics
-- name: GetBoardStats :one
SELECT 
    COUNT(DISTINCT l.id) as total_lists,
    COUNT(DISTINCT c.id) as total_cards,
    COUNT(DISTINCT m.user_id) as total_members,
    COUNT(DISTINCT lb.id) as total_labels,
    COUNT(DISTINCT cm.id) as total_comments,
    COUNT(CASE WHEN c.due_date IS NOT NULL AND c.due_date < NOW() THEN 1 END) as overdue_cards,
    COUNT(CASE WHEN c.due_date IS NOT NULL AND c.due_date > NOW() AND c.due_date <= NOW() + INTERVAL '7 days' THEN 1 END) as due_soon_cards
FROM boards b
LEFT JOIN lists l ON b.id = l.board_id
LEFT JOIN cards c ON l.id = c.list_id
LEFT JOIN memberships m ON b.id = m.board_id
LEFT JOIN labels lb ON b.id = lb.board_id
LEFT JOIN comments cm ON c.id = cm.card_id
WHERE b.id = $1;

-- Activity Statistics
-- name: GetBoardActivity :many
SELECT 
    DATE(c.created_at) as date,
    COUNT(DISTINCT c.id) as cards_created,
    COUNT(DISTINCT cm.id) as comments_made
FROM boards b
LEFT JOIN lists l ON b.id = l.board_id
LEFT JOIN cards c ON l.id = c.list_id AND c.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN comments cm ON c.id = cm.card_id AND cm.created_at >= NOW() - INTERVAL '30 days'
WHERE b.id = $1
GROUP BY DATE(c.created_at)
ORDER BY date DESC;

-- name: GetUserActivity :many
SELECT 
    DATE(activity_date) as date,
    activity_type,
    COUNT(*) as count
FROM (
    SELECT c.created_at as activity_date, 'card_created' as activity_type FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE b.owner_id = $1 OR EXISTS (
        SELECT 1 FROM memberships m WHERE m.board_id = b.id AND m.user_id = $1
    )
    
    UNION ALL
    
    SELECT cm.created_at as activity_date, 'comment_made' as activity_type FROM comments cm
    WHERE cm.user_id = $1
    
    UNION ALL
    
    SELECT b.created_at as activity_date, 'board_created' as activity_type FROM boards b
    WHERE b.owner_id = $1
) activities
WHERE activity_date >= NOW() - INTERVAL '30 days'
GROUP BY DATE(activity_date), activity_type
ORDER BY date DESC, activity_type;

-- Dashboard Queries
-- name: GetDashboardOverview :one
SELECT 
    (SELECT COUNT(*) FROM boards WHERE owner_id = $1) as owned_boards,
    (SELECT COUNT(*) FROM memberships WHERE user_id = $1) as member_boards,
    (SELECT COUNT(*) FROM assignments a 
     JOIN cards c ON a.card_id = c.id 
     WHERE a.user_id = $1) as assigned_cards,
    (SELECT COUNT(*) FROM assignments a 
     JOIN cards c ON a.card_id = c.id 
     WHERE a.user_id = $1 AND c.due_date IS NOT NULL AND c.due_date < NOW()) as overdue_assignments,
    (SELECT COUNT(*) FROM assignments a 
     JOIN cards c ON a.card_id = c.id 
     WHERE a.user_id = $1 AND c.due_date IS NOT NULL 
     AND c.due_date > NOW() AND c.due_date <= NOW() + INTERVAL '7 days') as due_soon_assignments;

-- name: GetRecentActivity :many
SELECT 
    activity_type,
    title,
    board_name,
    board_id,
    created_at,
    user_name
FROM (
    -- Recent cards created
    SELECT 
        'card_created' as activity_type,
        c.title,
        b.name as board_name,
        b.id as board_id,
        c.created_at,
        u.username as user_name
    FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    JOIN users u ON b.owner_id = u.id
    WHERE (b.owner_id = $1 OR EXISTS (
        SELECT 1 FROM memberships m WHERE m.board_id = b.id AND m.user_id = $1
    )) AND c.created_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    -- Recent comments
    SELECT 
        'comment_made' as activity_type,
        'Comment on: ' || c.title as title,
        b.name as board_name,
        b.id as board_id,
        cm.created_at,
        u.username as user_name
    FROM comments cm
    JOIN users u ON cm.user_id = u.id
    JOIN cards c ON cm.card_id = c.id
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE (b.owner_id = $1 OR EXISTS (
        SELECT 1 FROM memberships m WHERE m.board_id = b.id AND m.user_id = $1
    )) AND cm.created_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    -- Recent boards created
    SELECT 
        'board_created' as activity_type,
        b.name as title,
        b.name as board_name,
        b.id as board_id,
        b.created_at,
        u.username as user_name
    FROM boards b
    JOIN users u ON b.owner_id = u.id
    WHERE b.owner_id = $1 AND b.created_at >= NOW() - INTERVAL '7 days'
) activities
ORDER BY created_at DESC
LIMIT $2;

-- Performance Queries
-- name: GetMostActiveBoards :many
SELECT 
    b.id,
    b.name,
    b.created_at,
    COUNT(DISTINCT c.id) as card_count,
    COUNT(DISTINCT cm.id) as comment_count,
    COUNT(DISTINCT m.user_id) as member_count,
    MAX(COALESCE(c.created_at, cm.created_at, b.created_at)) as last_activity
FROM boards b
LEFT JOIN lists l ON b.id = l.board_id
LEFT JOIN cards c ON l.id = c.list_id
LEFT JOIN comments cm ON c.id = cm.card_id
LEFT JOIN memberships m ON b.id = m.board_id
WHERE b.owner_id = $1 OR EXISTS (
    SELECT 1 FROM memberships mem WHERE mem.board_id = b.id AND mem.user_id = $1
)
GROUP BY b.id, b.name, b.created_at
ORDER BY last_activity DESC
LIMIT $2;

-- name: GetMostActiveUsers :many
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT a.card_id) as assigned_cards,
    MAX(c.created_at) as last_comment
FROM users u
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN assignments a ON u.id = a.user_id
JOIN memberships m ON u.id = m.user_id
WHERE m.board_id = $1
GROUP BY u.id, u.username, u.email
ORDER BY comments_count DESC, assigned_cards DESC
LIMIT $2;

-- System Statistics
-- name: GetSystemStats :one
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM boards) as total_boards,
    (SELECT COUNT(*) FROM cards) as total_cards,
    (SELECT COUNT(*) FROM comments) as total_comments,
    (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_this_month,
    (SELECT COUNT(*) FROM boards WHERE created_at >= NOW() - INTERVAL '30 days') as new_boards_this_month;

-- Search and Filter Helpers
-- name: SearchBoardContent :many
SELECT 
    'card' as content_type,
    c.id,
    c.title,
    c.description as content,
    l.name as list_name,
    b.name as board_name,
    b.id as board_id
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN boards b ON l.board_id = b.id
WHERE (b.owner_id = $2 OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.board_id = b.id AND m.user_id = $2
)) AND (
    c.title ILIKE '%' || $1 || '%' OR 
    c.description ILIKE '%' || $1 || '%'
)

UNION ALL

SELECT 
    'comment' as content_type,
    cm.id,
    'Comment on: ' || c.title as title,
    cm.text as content,
    l.name as list_name,
    b.name as board_name,
    b.id as board_id
FROM comments cm
JOIN cards c ON cm.card_id = c.id
JOIN lists l ON c.list_id = l.id
JOIN boards b ON l.board_id = b.id
WHERE (b.owner_id = $2 OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.board_id = b.id AND m.user_id = $2
)) AND cm.text ILIKE '%' || $1 || '%'

ORDER BY board_name, content_type;
-- name: GetCardsPerList :many
SELECT 
    l.id,
    l.name,
    COUNT(c.id) as card_count
FROM lists l
LEFT JOIN cards c ON l.id = c.list_id
WHERE l.board_id = $1
GROUP BY l.id, l.name;

-- name: GetCardsPerMember :many
SELECT 
    u.id,
    u.username,
    u.profile_image,
    COUNT(DISTINCT CASE WHEN l.board_id = $1 THEN c.id END) as card_count
FROM users u
JOIN memberships m ON u.id = m.user_id
LEFT JOIN assignments a ON u.id = a.user_id
LEFT JOIN cards c ON a.card_id = c.id
LEFT JOIN lists l ON c.list_id = l.id
WHERE m.board_id = $1
GROUP BY u.id, u.username, u.profile_image;
