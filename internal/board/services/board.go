package services

import (
	"context"
	"fmt"

	"github.com/K44Z/boardly/internal/board/repository"
	"github.com/K44Z/boardly/internal/mq"
	userRepo "github.com/K44Z/boardly/internal/user/repository"
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
	AddMember(ctx context.Context, boardId *int32, userId *int32) error
}

type boardService struct {
	boardRepo repository.BoardRepository
	userRepo  userRepo.UserRepository
	mq        *mq.RabbitMQ
}

func NewBoardService(db *schemas.DB, mq *mq.RabbitMQ) BoardService {
	return &boardService{
		boardRepo: repository.NewBoardRepo(db),
		userRepo:  userRepo.NewUserRepository(db),
		mq:        mq,
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

	// Get member count and members for each board
	for i := range boards {
		count, err := s.boardRepo.CountBoardMembers(ctx, &boards[i].ID)
		if err == nil {
			boards[i].MemberCount = count
		}

		members, err := s.boardRepo.GetBoardMembers(ctx, &boards[i].ID)
		if err == nil {
			boards[i].Members = members
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

func (s *boardService) AddMember(ctx context.Context, boardId *int32, userId *int32) error {
	err := s.boardRepo.AddMember(ctx, boardId, userId)
	if err != nil {
		return err
	}

	user, err := s.userRepo.GetUserById(ctx, userId)
	if err != nil {
		fmt.Printf("Failed to fetch user for notification: %v\n", err)
		return nil
	}

	if s.mq != nil {
		notification := mq.EmailNotification{
			UserID:  *userId,
			BoardID: *boardId,
			Email:   user.Email,
			Message: fmt.Sprintf("You have been added to board %d", *boardId),
		}
		if err := s.mq.PublishAssignment(ctx, notification); err != nil {
			fmt.Printf("Failed to publish notification: %v\n", err)
		}
	}

	return nil
}
