
-- name: CreateBoard :one
INSERT INTO boards (name, owner_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetBoardByID :one
SELECT * FROM boards WHERE id = $1;

-- name: ListBoardsByOwner :many
SELECT * FROM boards WHERE owner_id = $1;

