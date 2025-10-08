package services

import (
	"context"

	"github.com/K44Z/boardly/services/user/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type UserService interface {
	CheckUser(ctx context.Context, email string) (*schemas.User, error)
	Register(ctx context.Context, u *schemas.User) error
}
type userService struct {
	repo repository.UserRepository
}

func NewUserService(db *schemas.DB) UserService {
	return &userService{
		repo: repository.NewUserRepository(db),
	}
}

func (s *userService) CheckUser(ctx context.Context, email string) (*schemas.User, error) {
	res, err := s.repo.Exists(ctx, email)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *userService) Register(ctx context.Context, u *schemas.User) error {
	err := s.repo.Register(ctx, u)
	if err != nil {
		return err
	}
	return nil
}
