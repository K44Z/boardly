-- Card Summaries (AI)
-- name: CreateCardSummary :one
INSERT INTO card_summaries (card_id, summary)
VALUES ($1, $2)
ON CONFLICT (card_id) DO UPDATE SET
summary = EXCLUDED.summary,
generated_at = NOW()
RETURNING *;

-- name: GetCardSummary :one
SELECT * FROM card_summaries WHERE card_id = $1;

-- name: GetCardSummaryWithCard :one
SELECT cs.*, c.title, c.description, l.name as list_name, l.board_id
FROM card_summaries cs
JOIN cards c ON cs.card_id = c.id
JOIN lists l ON c.list_id = l.id
WHERE cs.card_id = $1;

-- name: GetBoardCardSummaries :many
SELECT cs.*, c.title, c.description, l.name as list_name
FROM card_summaries cs
JOIN cards c ON cs.card_id = c.id
JOIN lists l ON c.list_id = l.id
WHERE l.board_id = $1
ORDER BY cs.generated_at DESC;

-- name: UpdateCardSummary :one
UPDATE card_summaries
SET summary = $2, generated_at = NOW()
WHERE card_id = $1
RETURNING *;

-- name: DeleteCardSummary :exec
DELETE FROM card_summaries WHERE card_id = $1;

-- name: GetRecentSummaries :many
SELECT cs.*, c.title, c.description, l.name as list_name, l.board_id
FROM card_summaries cs
JOIN cards c ON cs.card_id = c.id
JOIN lists l ON c.list_id = l.id
WHERE cs.generated_at >= NOW() - INTERVAL '7 days'
ORDER BY cs.generated_at DESC;

-- name: CountCardSummaries :one
SELECT COUNT(*) FROM card_summaries;

-- name: GetOldestSummaries :many
SELECT cs.*, c.title, c.description, l.name as list_name, l.board_id
FROM card_summaries cs
JOIN cards c ON cs.card_id = c.id
JOIN lists l ON c.list_id = l.id
ORDER BY cs.generated_at ASC
LIMIT $1;

-- Comment Suggestions (AI)
-- name: CreateCommentSuggestion :one
INSERT INTO comment_suggestions (card_id, suggestion)
VALUES ($1, $2)
RETURNING *;

-- name: GetCommentSuggestionByID :one
SELECT * FROM comment_suggestions WHERE id = $1;

-- name: GetCardCommentSuggestions :many
SELECT * FROM comment_suggestions 
WHERE card_id = $1 
ORDER BY generated_at DESC;

-- name: GetCardCommentSuggestionsLimit :many
SELECT * FROM comment_suggestions 
WHERE card_id = $1 
ORDER BY generated_at DESC
LIMIT $2;

-- name: GetBoardCommentSuggestions :many
SELECT cs.*, c.title as card_title, l.name as list_name
FROM comment_suggestions cs
JOIN cards c ON cs.card_id = c.id
JOIN lists l ON c.list_id = l.id
WHERE l.board_id = $1
ORDER BY cs.generated_at DESC;

-- name: GetRecentCommentSuggestions :many
SELECT cs.*, c.title as card_title, l.name as list_name, l.board_id
FROM comment_suggestions cs
JOIN cards c ON cs.card_id = c.id
JOIN lists l ON c.list_id = l.id
WHERE cs.generated_at >= NOW() - INTERVAL '24 hours'
ORDER BY cs.generated_at DESC;

-- name: DeleteCommentSuggestion :exec
DELETE FROM comment_suggestions WHERE id = $1;

-- name: DeleteCardCommentSuggestions :exec
DELETE FROM comment_suggestions WHERE card_id = $1;

-- name: DeleteOldCommentSuggestions :exec
DELETE FROM comment_suggestions 
WHERE generated_at < NOW() - INTERVAL '30 days';

-- name: CountCommentSuggestions :one
SELECT COUNT(*) FROM comment_suggestions;

-- name: CountCardCommentSuggestions :one
SELECT COUNT(*) FROM comment_suggestions WHERE card_id = $1;
