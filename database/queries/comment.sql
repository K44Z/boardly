-- Comments
-- name: CreateComment :one
INSERT INTO comments (card_id, user_id, text)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetCommentByID :one
SELECT c.*, u.username, u.email
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.id = $1;

-- name: GetCardComments :many
SELECT c.*, u.username, u.email
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.card_id = $1
ORDER BY c.created_at ASC;

-- name: GetCardCommentsPaginated :many
SELECT c.*, u.username, u.email
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.card_id = $1
ORDER BY c.created_at ASC
LIMIT $2 OFFSET $3;

-- name: GetUserComments :many
SELECT c.*, u.username, cards.title as card_title, l.name as list_name, l.board_id
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN cards ON c.card_id = cards.id
JOIN lists l ON cards.list_id = l.id
WHERE c.user_id = $1
ORDER BY c.created_at DESC;

-- name: GetBoardComments :many
SELECT c.*, u.username, cards.title as card_title, l.name as list_name
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN cards ON c.card_id = cards.id
JOIN lists l ON cards.list_id = l.id
WHERE l.board_id = $1
ORDER BY c.created_at DESC;

-- name: UpdateComment :one
UPDATE comments
SET text = $2
WHERE id = $1
RETURNING *;

-- name: DeleteComment :exec
DELETE FROM comments WHERE id = $1;

-- name: DeleteCardComments :exec
DELETE FROM comments WHERE card_id = $1;

-- name: DeleteUserComments :exec
DELETE FROM comments WHERE user_id = $1;

-- name: CountCardComments :one
SELECT COUNT(*) FROM comments WHERE card_id = $1;

-- name: CountUserComments :one
SELECT COUNT(*) FROM comments WHERE user_id = $1;

-- name: GetRecentComments :many
SELECT c.*, u.username, cards.title as card_title, l.name as list_name, l.board_id
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN cards ON c.card_id = cards.id
JOIN lists l ON cards.list_id = l.id
WHERE c.created_at >= NOW() - INTERVAL '7 days'
ORDER BY c.created_at DESC
LIMIT $1;

-- name: SearchComments :many
SELECT c.*, u.username, cards.title as card_title, l.name as list_name, l.board_id
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN cards ON c.card_id = cards.id
JOIN lists l ON cards.list_id = l.id
WHERE c.text ILIKE '%' || $1 || '%'
ORDER BY c.created_at DESC;

-- name: GetCommentsByDateRange :many
SELECT c.*, u.username, cards.title as card_title, l.name as list_name, l.board_id
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN cards ON c.card_id = cards.id
JOIN lists l ON cards.list_id = l.id
WHERE c.created_at >= $1 AND c.created_at <= $2
ORDER BY c.created_at DESC;