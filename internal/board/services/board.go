package services

import (
	"context"

	"github.com/K44Z/boardly/internal/board/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type BoardService interface {
	CreateBoard(ctx context.Context, name *string, ownerID *int32) (*schemas.Board, error)
	GetBoardByID(ctx context.Context, id *int32) (*schemas.Board, error)
	GetBoardWithOwner(ctx context.Context, id *int32) (*schemas.Board, error)
	ListBoardsByUser(ctx context.Context, userId *int32) ([]schemas.BoardWithOwner, error)
	UpdateBoard(ctx context.Context, id *int32, name *string) (*schemas.Board, error)
	DeleteBoard(ctx context.Context, id *int32) error
	GetFullBoard(ctx context.Context, id *int32) (*schemas.BoardWithListsAndCards, error)
}

type boardService struct {
	boardRepo repository.BoardRepository
}

func NewBoardService(db *schemas.DB) BoardService {
	return &boardService{
		boardRepo: repository.NewBoardRepo(db),
	}
}

func (s *boardService) CreateBoard(ctx context.Context, name *string, ownerID *int32) (*schemas.Board, error) {
	res, err := s.boardRepo.Create(ctx, name, ownerID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *boardService) GetBoardByID(ctx context.Context, id *int32) (*schemas.Board, error) {
	res, err := s.boardRepo.GetById(ctx, id)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *boardService) GetBoardWithOwner(ctx context.Context, id *int32) (*schemas.Board, error) {
	res, err := s.boardRepo.GetBoardWithOwner(ctx, id)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *boardService) ListBoardsByUser(ctx context.Context, userId *int32) ([]schemas.BoardWithOwner, error) {
	boards, err := s.boardRepo.ListBoardsByUser(ctx, userId)
	if err != nil {
		return nil, err
	}

	// Get member count for each board
	for i := range boards {
		count, err := s.boardRepo.CountBoardMembers(ctx, &boards[i].ID)
		if err == nil {
			boards[i].MemberCount = count
		}
	}

	return boards, nil
}

func (s *boardService) UpdateBoard(ctx context.Context, id *int32, name *string) (*schemas.Board, error) {
	res, err := s.boardRepo.UpdateBoard(ctx, id, name)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *boardService) DeleteBoard(ctx context.Context, id *int32) error {
	return s.boardRepo.DeleteBoard(ctx, id)
}

func (s *boardService) GetFullBoard(ctx context.Context, id *int32) (*schemas.BoardWithListsAndCards, error) {
	return s.boardRepo.GetBoardWithListsAndCards(ctx, id)
}
