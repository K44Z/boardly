
-- name: CreateList :one
INSERT INTO lists (board_id, name, position)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetListByID :one
SELECT * FROM lists WHERE id = $1;

-- name: GetListsByBoard :many
SELECT * FROM lists WHERE board_id = $1 ORDER BY position;

-- name: GetListWithCardCount :one
SELECT l.*, COUNT(c.id) as card_count
FROM lists l
LEFT JOIN cards c ON l.id = c.list_id
WHERE l.id = $1
GROUP BY l.id;

-- name: GetListsWithCardCount :many
SELECT l.*, COUNT(c.id) as card_count
FROM lists l
LEFT JOIN cards c ON l.id = c.list_id
WHERE l.board_id = $1
GROUP BY l.id
ORDER BY l.position;

-- name: UpdateListTitle :one
UPDATE lists
SET name = $2
WHERE id = $1
RETURNING *;

-- name: UpdateListPosition :exec
UPDATE lists
SET position = $2
WHERE id = $1;

-- name: UpdateListPositions :exec
UPDATE lists
SET position = 
    CASE
        WHEN id = ANY($1::int[]) THEN 
            (array_position($1::int[], id) - 1)
        ELSE position
    END
WHERE board_id = $2;

-- name: DeleteList :exec
DELETE FROM lists WHERE id = $1;

-- name: GetMaxListPosition :one
SELECT COALESCE(MAX(position), -1) as max_position
FROM lists WHERE board_id = $1;

-- name: ReorderListsAfterDelete :exec
UPDATE lists
SET position = position - 1
WHERE board_id = $1 AND position > $2;

-- name: CountListsByBoard :one
SELECT COUNT(*) FROM lists WHERE board_id = $1;

-- name: GetListBoard :one
SELECT board_id FROM lists WHERE id = $1;

