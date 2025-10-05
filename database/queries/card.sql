
-- name: CreateCard :one
INSERT INTO cards (list_id, title, description, position, due_date)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetCardByID :one
SELECT * FROM cards WHERE id = $1;

-- name: GetCardsByList :many
SELECT * FROM cards WHERE list_id = $1 ORDER BY position;

-- name: UpdateCard :one
UPDATE cards
SET title = $2, description = $3, due_date = $4
WHERE id = $1
RETURNING *;

-- name: MoveCard :exec
UPDATE cards
SET list_id = $2, position = $3
WHERE id = $1;

-- name: DeleteCard :exec
DELETE FROM cards WHERE id = $1;


