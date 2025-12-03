-- Labels
-- name: CreateLabel :one
INSERT INTO labels (board_id, name, color)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetLabelByID :one
SELECT * FROM labels WHERE id = $1;

-- name: GetLabelsByBoard :many
SELECT * FROM labels WHERE board_id = $1 ORDER BY name;

-- name: GetLabelWithCardCount :one
SELECT l.*, COUNT(cl.card_id) as card_count
FROM labels l
LEFT JOIN card_labels cl ON l.id = cl.label_id
WHERE l.id = $1
GROUP BY l.id;

-- name: GetLabelsWithCardCount :many
SELECT l.*, COUNT(cl.card_id) as card_count
FROM labels l
LEFT JOIN card_labels cl ON l.id = cl.label_id
WHERE l.board_id = $1
GROUP BY l.id
ORDER BY l.name;

-- name: UpdateLabel :one
UPDATE labels
SET name = $2, color = $3
WHERE id = $1
RETURNING *;

-- name: UpdateLabelName :one
UPDATE labels
SET name = $2
WHERE id = $1
RETURNING *;

-- name: UpdateLabelColor :one
UPDATE labels
SET color = $2
WHERE id = $1
RETURNING *;

-- name: DeleteLabel :exec
DELETE FROM labels WHERE id = $1;

-- name: SearchLabels :many
SELECT * FROM labels 
WHERE board_id = $1 AND name ILIKE '%' || $2 || '%'
ORDER BY name;

-- name: GetLabelsByColor :many
SELECT * FROM labels 
WHERE board_id = $1 AND color = $2
ORDER BY name;

-- name: CountLabelsByBoard :one
SELECT COUNT(*) FROM labels WHERE board_id = $1;

-- Card Labels
-- name: AddLabelToCard :exec
INSERT INTO card_labels (card_id, label_id)
VALUES ($1, $2)
ON CONFLICT (card_id, label_id) DO NOTHING;

-- name: RemoveLabelFromCard :exec
DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2;

-- name: GetCardLabels :many
SELECT l.*
FROM labels l
JOIN card_labels cl ON l.id = cl.label_id
WHERE cl.card_id = $1
ORDER BY l.name;

-- name: GetLabelCards :many
SELECT c.*, l.name as list_name, l.board_id
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN card_labels cl ON c.id = cl.card_id
WHERE cl.label_id = $1
ORDER BY c.created_at DESC;

-- name: RemoveAllLabelsFromCard :exec
DELETE FROM card_labels WHERE card_id = $1;

-- name: CheckCardHasLabel :one
SELECT EXISTS(
    SELECT 1 FROM card_labels 
    WHERE card_id = $1 AND label_id = $2
) as has_label;

-- name: GetMostUsedLabels :many
SELECT l.*, COUNT(cl.card_id) as usage_count
FROM labels l
LEFT JOIN card_labels cl ON l.id = cl.label_id
WHERE l.board_id = $1
GROUP BY l.id
ORDER BY usage_count DESC, l.name
LIMIT $2;

-- name: GetAllLabels :many 
SELECT * FROM labels;
