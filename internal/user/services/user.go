package services

import (
	"context"

	"github.com/K44Z/boardly/internal/user/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type UserService interface {
	CheckUser(ctx context.Context, email *string) (*schemas.User, error)
	Register(ctx context.Context, u *schemas.User) error
	SearchUsers(ctx context.Context, query *string) ([]schemas.User, error)
	UpdateUserPassword(ctx context.Context, user *schemas.User, new string) error
	UpdateEmail(ctx context.Context, user *schemas.User) (*schemas.User, error)
	GetUserById(ctx context.Context, id *int32) (*schemas.User, error)
	DeleteUser(ctx context.Context, id *int32) error
}
type userService struct {
	repo repository.UserRepository
}

func NewUserService(db *schemas.DB) UserService {
	return &userService{
		repo: repository.NewUserRepository(db),
	}
}

func (s *userService) CheckUser(ctx context.Context, email *string) (*schemas.User, error) {
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

func (s *userService) SearchUsers(ctx context.Context, query *string) ([]schemas.User, error) {
	res, err := s.repo.SearchUsers(ctx, query)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *userService) UpdateUserPassword(ctx context.Context, user *schemas.User, new string) error {
	err := s.repo.UpdateUserPassword(ctx, user, new)
	if err != nil {
		return err
	}
	return nil
}

func (s *userService) UpdateEmail(ctx context.Context, user *schemas.User) (*schemas.User, error) {
	res, err := s.repo.UpdateEmail(ctx, user)
	if err != nil {
		return nil, err
	}
	return res, err
}

func (s *userService) GetUserById(ctx context.Context, id *int32) (*schemas.User, error) {
	res, err := s.repo.GetUserById(ctx, id)
	if err != nil {
		return nil, err
	}
	return res, err
}

func (s *userService) DeleteUser(ctx context.Context, id *int32) error {
	err := s.repo.DeleteUser(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
