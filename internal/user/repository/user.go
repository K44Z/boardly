package repository

import (
	"context"
	"errors"
	"fmt"

	sqlc "github.com/K44Z/boardly/database/generated"
	dto "github.com/K44Z/boardly/internal/user"
	"github.com/K44Z/boardly/shared/schemas"

	"github.com/K44Z/boardly/shared/utils"
	"github.com/jackc/pgx/v5"
)

type UserRepository interface {
	Register(ctx context.Context, u *schemas.User) error
	Exists(ctx context.Context, email *string) (*schemas.User, error)
	SearchUsers(ctx context.Context, query *string) ([]schemas.User, error)
	UpdateUserPassword(ctx context.Context, user *schemas.User, new string) error
	UpdateEmail(ctx context.Context, user *schemas.User) (*schemas.User, error)
	GetUserById(ctx context.Context, id *int32) (*schemas.User, error)
	DeleteUser(ctx context.Context, id *int32) error
	GetAll(ctx context.Context) ([]schemas.User, error)
}

type userRepository struct {
	queries *sqlc.Queries
}

func NewUserRepository(db *schemas.DB) UserRepository {
	return &userRepository{
		queries: sqlc.New(db.DBTX),
	}
}

func (r *userRepository) Exists(ctx context.Context, email *string) (*schemas.User, error) {
	user, err := r.queries.GetUserByEmail(ctx, *email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.UserNotFound
		}
		return nil, err
	}
	return &schemas.User{
		ID:           user.ID,
		Username:     user.Username,
		Email:        user.Email,
		Password:     user.Password,
		ProfileImage: &user.ProfileImage,
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

func (r *userRepository) GetUserById(ctx context.Context, id *int32) (*schemas.User, error) {
	res, err := r.queries.GetUserByID(ctx, *id)
	if err != nil {
		return nil, err
	}
	return &schemas.User{
		Username: res.Username,
		Email:    res.Email,
	}, nil

}

func (r *userRepository) UpdateEmail(ctx context.Context, user *schemas.User) (*schemas.User, error) {
	res, err := r.queries.UpdateUserEmail(ctx, sqlc.UpdateUserEmailParams{
		ID:    user.ID,
		Email: user.Email,
	})
	if err != nil {
		return nil, err
	}
	fmt.Println(res)
	return &schemas.User{
		ID:       res.ID,
		Email:    res.Email,
		Username: res.Username,
	}, nil
}

func (r *userRepository) UpdateUserPassword(ctx context.Context, user *schemas.User, new string) error {
	_, err := r.queries.UpdateUserPassword(ctx, sqlc.UpdateUserPasswordParams{
		ID:       user.ID,
		Password: new,
	})
	if err != nil {
		return err
	}
	return err
}

func (r *userRepository) SearchUsers(ctx context.Context, query *string) ([]schemas.User, error) {
	res, err := r.queries.SearchUsers(ctx, *query)
	if err != nil {
		return nil, err
	}
	return dto.NewUsers(res), nil
}

func (r *userRepository) DeleteUser(ctx context.Context, id *int32) error {
	err := r.queries.DeleteUser(ctx, *id)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) GetAll(ctx context.Context) ([]schemas.User, error) {
	users, err := r.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	return dto.NewUsers(users), nil
}
