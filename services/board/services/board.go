package services

import (
	"context"

	"github.com/K44Z/boardly/services/board/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type BoardService interface {
	CreateBoard(ctx context.Context, name string, ownerID int32) (*schemas.Board, error)
	GetBoardByID(ctx context.Context, id int32) (*schemas.Board, error)
}

type boardService struct {
	boardRepo repository.BoardRepository
}

func NewBoardService(db *schemas.DB) BoardService {
	return &boardService{
		boardRepo: repository.NewBoardRepo(db),
	}
}

func (s *boardService) CreateBoard(ctx context.Context, name string, ownerID int32) (*schemas.Board, error) {
	res, err := s.boardRepo.Create(ctx, name, ownerID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (s *boardService) GetBoardByID(ctx context.Context, id int32) (*schemas.Board, error) {
	res, err := s.boardRepo.GetById(ctx, id)
	if err != nil {
		return nil, err
	}
	return res, nil
}
