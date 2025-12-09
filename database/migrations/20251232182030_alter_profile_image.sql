-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
ALTER COLUMN profile_image SET DEFAULT '',
ALTER COLUMN profile_image SET NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
