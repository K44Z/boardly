package repository

import (
	"context"
	"errors"

	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/schemas"
	"github.com/K44Z/boardly/services/user/utils"
	"github.com/jackc/pgx/v5"
)

type UserRepository interface {
	Register(ctx context.Context, u *schemas.User) error
	Exists(ctx context.Context, email string) (*schemas.User, error)
}

type userRepository struct {
	queries *sqlc.Queries
}

func NewUserRepository(db *schemas.DB) UserRepository {
	return &userRepository{
		queries: sqlc.New(db.DBTX),
	}
}

func (r *userRepository) Exists(ctx context.Context, email string) (*schemas.User, error) {
	user, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.UserNotFound
		}
		return nil, err
	}
	return &schemas.User{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Password: user.Password,
	}, nil

}

func (r *userRepository) Register(ctx context.Context, u *schemas.User) error {
	_, err := r.queries.CreateUser(ctx, sqlc.CreateUserParams{
		Username: u.Username,
		Email:    u.Email,
		Password: u.Password,
	})
	if err != nil {
		return err
	}
	return nil
}
