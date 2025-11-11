-- Assignments
-- name: AssignUserToCard :exec
INSERT INTO assignments (card_id, user_id)
VALUES ($1, $2)
ON CONFLICT (card_id, user_id) DO NOTHING;

-- name: UnassignUserFromCard :exec
DELETE FROM assignments WHERE card_id = $1 AND user_id = $2;

-- name: GetCardAssignees :many
SELECT u.*
FROM users u
JOIN assignments a ON u.id = a.user_id
WHERE a.card_id = $1
ORDER BY u.username;

-- name: GetUserAssignedCards :many
SELECT c.*, l.name as list_name, l.board_id, b.name as board_name
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN boards b ON l.board_id = b.id
JOIN assignments a ON c.id = a.card_id
WHERE a.user_id = $1
ORDER BY c.created_at DESC;

-- name: GetUserAssignedCardsByBoard :many
SELECT c.*, l.name as list_name
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN assignments a ON c.id = a.card_id
WHERE a.user_id = $1 AND l.board_id = $2
ORDER BY c.created_at DESC;

-- name: GetBoardAssignments :many
SELECT a.*, u.username, u.email, c.title as card_title, l.name as list_name
FROM assignments a
JOIN users u ON a.user_id = u.id
JOIN cards c ON a.card_id = c.id
JOIN lists l ON c.list_id = l.id
WHERE l.board_id = $1
ORDER BY u.username;

-- name: RemoveAllAssignmentsFromCard :exec
DELETE FROM assignments WHERE card_id = $1;

-- name: RemoveAllUserAssignments :exec
DELETE FROM assignments WHERE user_id = $1;

-- name: CheckUserAssignedToCard :one
SELECT EXISTS(
    SELECT 1 FROM assignments 
    WHERE card_id = $1 AND user_id = $2
) as is_assigned;

-- name: CountCardAssignees :one
SELECT COUNT(*) FROM assignments WHERE card_id = $1;

-- name: CountUserAssignments :one
SELECT COUNT(*) FROM assignments WHERE user_id = $1;

-- name: GetAssignmentsByUser :many
SELECT a.*, c.title as card_title, l.name as list_name, b.name as board_name
FROM assignments a
JOIN cards c ON a.card_id = c.id
JOIN lists l ON c.list_id = l.id
JOIN boards b ON l.board_id = b.id
WHERE a.user_id = $1
ORDER BY c.created_at DESC;

-- name: GetOverdueAssignedCards :many
SELECT c.*, l.name as list_name, l.board_id, u.username
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN assignments a ON c.id = a.card_id
JOIN users u ON a.user_id = u.id
WHERE c.due_date IS NOT NULL 
AND c.due_date < NOW()
AND a.user_id = $1
ORDER BY c.due_date ASC;

-- name: GetAssignedCardsDueSoon :many
SELECT c.*, l.name as list_name, l.board_id, u.username
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN assignments a ON c.id = a.card_id
JOIN users u ON a.user_id = u.id
WHERE c.due_date IS NOT NULL 
AND c.due_date > NOW() 
AND c.due_date <= NOW() + INTERVAL '7 days'
AND a.user_id = $1
ORDER BY c.due_date ASC;