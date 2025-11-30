-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN profile_image TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN profile_image;
-- +goose StatementEnd
