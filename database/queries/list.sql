
-- name: CreateList :one
INSERT INTO lists (board_id, name, position)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetListsByBoard :many
SELECT * FROM lists WHERE board_id = $1 ORDER BY position;

-- name: UpdateListTitle :one
UPDATE lists
SET name = $2
WHERE id = $1
RETURNING *;

-- name: UpdateListPosition :exec
UPDATE lists
SET position = $2
WHERE id = $1;

-- name: DeleteList :exec
DELETE FROM lists WHERE id = $1;

