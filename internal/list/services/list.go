package services

import (
	"context"

	"github.com/K44Z/boardly/internal/list/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type ListService interface {
	CreateList(ctx context.Context, boardID int32, name string, position int32) (*schemas.List, error)
	GetListByID(ctx context.Context, id int32) (*schemas.List, error)
	GetListsByBoard(ctx context.Context, boardID int32) ([]schemas.List, error)
	GetListWithCardCount(ctx context.Context, id int32) (*schemas.ListWithCardCount, error)
	GetListsWithCardCount(ctx context.Context, boardID int32) ([]schemas.ListWithCardCount, error)
	UpdateListTitle(ctx context.Context, id int32, name string) (*schemas.List, error)
	UpdateListPosition(ctx context.Context, id int32, position int32) error
	UpdateListPositions(ctx context.Context, ids []int32, boardID int32) error
	DeleteList(ctx context.Context, id int32) error
	GetMaxListPosition(ctx context.Context, boardID int32) (int32, error)
	ReorderListsAfterDelete(ctx context.Context, boardID int32, position int32) error
	CountListsByBoard(ctx context.Context, boardID int32) (int64, error)
	GetListBoard(ctx context.Context, id int32) (int32, error)
}

type listService struct {
	repo repository.ListRepository
}

func NewListService(db *schemas.DB) ListService {
	return &listService{
		repo: repository.NewListRepository(db),
	}
}

func (s *listService) CreateList(ctx context.Context, boardID int32, name string, position int32) (*schemas.List, error) {
	return s.repo.CreateList(ctx, boardID, name, position)
}

func (s *listService) GetListByID(ctx context.Context, id int32) (*schemas.List, error) {
	return s.repo.GetListByID(ctx, id)
}

func (s *listService) GetListsByBoard(ctx context.Context, boardID int32) ([]schemas.List, error) {
	return s.repo.GetListsByBoard(ctx, boardID)
}

func (s *listService) GetListWithCardCount(ctx context.Context, id int32) (*schemas.ListWithCardCount, error) {
	return s.repo.GetListWithCardCount(ctx, id)
}

func (s *listService) GetListsWithCardCount(ctx context.Context, boardID int32) ([]schemas.ListWithCardCount, error) {
	return s.repo.GetListsWithCardCount(ctx, boardID)
}

func (s *listService) UpdateListTitle(ctx context.Context, id int32, name string) (*schemas.List, error) {
	return s.repo.UpdateListTitle(ctx, id, name)
}

func (s *listService) UpdateListPosition(ctx context.Context, id int32, position int32) error {
	return s.repo.UpdateListPosition(ctx, id, position)
}

func (s *listService) UpdateListPositions(ctx context.Context, ids []int32, boardID int32) error {
	return s.repo.UpdateListPositions(ctx, ids, boardID)
}

func (s *listService) DeleteList(ctx context.Context, id int32) error {
	return s.repo.DeleteList(ctx, id)
}

func (s *listService) GetMaxListPosition(ctx context.Context, boardID int32) (int32, error) {
	return s.repo.GetMaxListPosition(ctx, boardID)
}

func (s *listService) ReorderListsAfterDelete(ctx context.Context, boardID int32, position int32) error {
	return s.repo.ReorderListsAfterDelete(ctx, boardID, position)
}

func (s *listService) CountListsByBoard(ctx context.Context, boardID int32) (int64, error) {
	return s.repo.CountListsByBoard(ctx, boardID)
}

func (s *listService) GetListBoard(ctx context.Context, id int32) (int32, error) {
	return s.repo.GetListBoard(ctx, id)
}
