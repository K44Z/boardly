
-- name: CreateCard :one
INSERT INTO cards (list_id, title, description, position, due_date)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetCardByID :one
SELECT * FROM cards WHERE id = $1;

-- name: GetCardWithDetails :one
SELECT c.*, l.name as list_name, l.board_id
FROM cards c
JOIN lists l ON c.list_id = l.id
WHERE c.id = $1;

-- name: GetCardsByList :many
SELECT * FROM cards WHERE list_id = $1 ORDER BY position;

-- name: GetCardsByBoard :many
SELECT c.*, l.name as list_name
FROM cards c
JOIN lists l ON c.list_id = l.id
WHERE l.board_id = $1
ORDER BY l.position, c.position;

-- name: UpdateCard :one
UPDATE cards
SET title = $2, description = $3, due_date = $4
WHERE id = $1
RETURNING *;

-- name: UpdateCardTitle :one
UPDATE cards
SET title = $2
WHERE id = $1
RETURNING *;

-- name: UpdateCardDescription :one
UPDATE cards
SET description = $2
WHERE id = $1
RETURNING *;

-- name: UpdateCardDueDate :one
UPDATE cards
SET due_date = $2
WHERE id = $1
RETURNING *;

-- name: UpdateCardPosition :exec
UPDATE cards
SET position = $2
WHERE id = $1;

-- name: MoveCard :exec
UPDATE cards
SET list_id = $2, position = $3
WHERE id = $1;

-- name: MoveCardWithinList :exec
UPDATE cards
SET position = $2
WHERE id = $1;

-- name: UpdateCardPositions :exec
UPDATE cards
SET position = 
    CASE
        WHEN id = ANY($1::int[]) THEN 
            (array_position($1::int[], id) - 1)
        ELSE position
    END
WHERE list_id = $2;

-- name: DeleteCard :exec
DELETE FROM cards WHERE id = $1;

-- name: GetMaxCardPosition :one
SELECT COALESCE(MAX(position), -1) as max_position
FROM cards WHERE list_id = $1;

-- name: ReorderCardsAfterDelete :exec
UPDATE cards
SET position = position - 1
WHERE list_id = $1 AND position > $2;

-- name: GetOverdueCards :many
SELECT c.*, l.name as list_name, l.board_id
FROM cards c
JOIN lists l ON c.list_id = l.id
WHERE c.due_date IS NOT NULL AND c.due_date < NOW()
ORDER BY c.due_date ASC;

-- name: GetCardsDueSoon :many
SELECT c.*, l.name as list_name, l.board_id
FROM cards c
JOIN lists l ON c.list_id = l.id
WHERE c.due_date IS NOT NULL 
AND c.due_date > NOW() 
AND c.due_date <= NOW() + INTERVAL '7 days'
ORDER BY c.due_date ASC;

-- name: SearchCards :many
SELECT c.*, l.name as list_name, l.board_id
FROM cards c
JOIN lists l ON c.list_id = l.id
WHERE c.title ILIKE '%' || $1 || '%' OR c.description ILIKE '%' || $1 || '%'
ORDER BY c.created_at DESC;

-- name: CountCardsByList :one
SELECT COUNT(*) FROM cards WHERE list_id = $1;

-- name: GetCardList :one
SELECT list_id FROM cards WHERE id = $1;


