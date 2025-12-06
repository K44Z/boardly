-- name: CreateBoard :one
INSERT INTO boards (name, owner_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetBoardByID :one
SELECT * FROM boards WHERE id = $1;

-- name: GetBoardWithOwner :one
SELECT b.*, u.username as owner_username, u.email as owner_email, COALESCE(u.profile_image, '') as owner_profile_image
FROM boards b
JOIN users u ON b.owner_id = u.id
WHERE b.id = $1;

-- name: ListBoardsByOwner :many
SELECT * FROM boards WHERE owner_id = $1 ORDER BY created_at DESC;

-- name: ListBoardsByUser :many
SELECT DISTINCT b.*, u.username as owner_username
FROM boards b
JOIN users u ON b.owner_id = u.id
LEFT JOIN memberships m ON b.id = m.board_id
LEFT JOIN lists l ON b.id = l.board_id
LEFT JOIN cards c ON l.id = c.list_id
LEFT JOIN assignments a ON c.id = a.card_id
WHERE b.owner_id = $1 
   OR m.user_id = $1
   OR a.user_id = $1
ORDER BY b.created_at DESC;

-- name: UpdateBoard :one
UPDATE boards
SET name = $2
WHERE id = $1
RETURNING *;

-- name: DeleteBoard :exec
DELETE FROM boards WHERE id = $1;

-- name: SearchBoards :many
SELECT b.*, u.username as owner_username
FROM boards b
JOIN users u ON b.owner_id = u.id
WHERE b.name ILIKE '%' || $1 || '%'
ORDER BY b.created_at DESC;

-- name: CountBoardsByOwner :one
SELECT COUNT(*) FROM boards WHERE owner_id = $1;

-- Memberships
-- name: CreateMembership :one
INSERT INTO memberships (board_id, user_id, role)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetMembership :one
SELECT * FROM memberships
WHERE board_id = $1 AND user_id = $2;

-- name: GetBoardMembers :many
SELECT m.*, u.username, u.email, COALESCE(u.profile_image, '') as profile_image
FROM memberships m
JOIN users u ON m.user_id = u.id
WHERE m.board_id = $1
ORDER BY m.created_at ASC;

-- name: GetUserMemberships :many
SELECT m.*, b.name as board_name
FROM memberships m
JOIN boards b ON m.board_id = b.id
WHERE m.user_id = $1
ORDER BY m.created_at DESC;

-- name: UpdateMembershipRole :one
UPDATE memberships
SET role = $3
WHERE board_id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteMembership :exec
DELETE FROM memberships WHERE board_id = $1 AND user_id = $2;

-- name: DeleteBoardMemberships :exec
DELETE FROM memberships WHERE board_id = $1;

-- name: CheckBoardAccess :one
SELECT EXISTS(
    SELECT 1 FROM boards b
    LEFT JOIN memberships m ON b.id = m.board_id
    LEFT JOIN lists l ON b.id = l.board_id
    LEFT JOIN cards c ON l.id = c.list_id
    LEFT JOIN assignments a ON c.id = a.card_id
    WHERE b.id = $1 AND (
        b.owner_id = $2 
        OR m.user_id = $2
        OR a.user_id = $2
    )
) as has_access;

-- name: CheckBoardOwnership :one
SELECT EXISTS(
    SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
) as is_owner;

-- name: CountBoardMembers :one
SELECT COUNT(*) FROM memberships WHERE board_id = $1;

-- name: GetBoardWithListsAndCards :many
SELECT 
    b.id as board_id,
    b.name as board_name,
    b.owner_id,
    b.created_at as board_created_at,
    u.username as owner_username,
    u.email as owner_email,
    COALESCE(u.profile_image, '') as owner_profile_image,
    l.id as list_id,
    l.name as list_name,
    l.position as list_position,
    l.created_at as list_created_at,
    c.id as card_id,
    c.title as card_title,
    c.description as card_description,
    c.position as card_position,
    c.created_at as card_created_at,
    lb.id as label_id,
    lb.name as label_name,
    lb.color as label_color
FROM boards b
JOIN users u ON b.owner_id = u.id
LEFT JOIN lists l ON b.id = l.board_id
LEFT JOIN cards c ON l.id = c.list_id
LEFT JOIN card_labels cl ON c.id = cl.card_id
LEFT JOIN labels lb ON cl.label_id = lb.id
WHERE b.id = $1
ORDER BY l.position ASC, c.position ASC, lb.id ASC;
