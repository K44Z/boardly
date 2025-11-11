-- name: CreateUser :one
INSERT INTO users (username, email, password)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

-- name: ListUsers :many
SELECT * FROM users ORDER BY created_at DESC;

-- name: ListUsersPaginated :many
SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: UpdateUser :one
UPDATE users
SET username = $2, email = $3
WHERE id = $1
RETURNING *;

-- name: UpdateUserPassword :one
UPDATE users
SET password = $2
WHERE id = $1
RETURNING *;

-- name: UpdateUserEmail :one
UPDATE users
SET email = $2
WHERE id = $1
RETURNING *;

-- name: UpdateUserUsername :one
UPDATE users
SET username = $2
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: SearchUsers :many
SELECT * FROM users 
WHERE username ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%'
ORDER BY created_at DESC;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- Sessions
-- name: CreateSession :one
INSERT INTO sessions (user_id, token, expires_at)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetSessionByToken :one
SELECT s.*, u.id as user_id, u.username, u.email
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.token = $1 AND s.expires_at > NOW();

-- name: GetUserSessions :many
SELECT * FROM sessions 
WHERE user_id = $1 AND expires_at > NOW()
ORDER BY created_at DESC;

-- name: DeleteSession :exec
DELETE FROM sessions WHERE token = $1;

-- name: DeleteUserSessions :exec
DELETE FROM sessions WHERE user_id = $1;

-- name: DeleteExpiredSessions :exec
DELETE FROM sessions WHERE expires_at <= NOW();

-- name: UpdateSessionExpiry :one
UPDATE sessions
SET expires_at = $2
WHERE token = $1
RETURNING *;

