package repository

import (
	"context"

	sqlc "github.com/K44Z/boardly/database/generated"
	dto "github.com/K44Z/boardly/internal/user"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgtype"
)

type BoardRepository interface {
	Create(ctx context.Context, name *string, ownerId *int32) (*schemas.Board, error)
	GetById(ctx context.Context, id *int32) (*schemas.Board, error)
	GetBoardWithOwner(ctx context.Context, id *int32) (*schemas.Board, error)
	ListBoardsByUser(ctx context.Context, userId *int32) ([]schemas.BoardWithOwner, error)
	UpdateBoard(ctx context.Context, id *int32, name *string) (*schemas.Board, error)
	DeleteBoard(ctx context.Context, id *int32) error
	CountBoardMembers(ctx context.Context, boardId *int32) (int64, error)
}

type boardrepo struct {
	queries *sqlc.Queries
}

func NewBoardRepo(db *schemas.DB) BoardRepository {
	return &boardrepo{
		queries: sqlc.New(db.DBTX),
	}
}

func (r *boardrepo) Create(ctx context.Context, name *string, ownerId *int32) (*schemas.Board, error) {
	res, err := r.queries.CreateBoard(ctx, sqlc.CreateBoardParams{
		Name: *name,
		OwnerID: pgtype.Int4{
			Int32: *ownerId,
			Valid: true,
		},
	})
	if err != nil {
		return nil, err
	}
	return &schemas.Board{
		ID:      res.ID,
		Name:    res.Name,
		OwnerID: res.OwnerID,
	}, nil
}

func (r *boardrepo) GetById(ctx context.Context, id *int32) (*schemas.Board, error) {
	res, err := r.queries.GetBoardByID(ctx, *id)
	if err != nil {
		return nil, err
	}
	return &schemas.Board{
		ID:      res.ID,
		Name:    res.Name,
		OwnerID: res.OwnerID,
	}, nil
}

func (r *boardrepo) GetBoardWithOwner(ctx context.Context, id *int32) (*schemas.Board, error) {
	res, err := r.queries.GetBoardWithOwner(ctx, *id)
	if err != nil {
		return nil, err
	}
	return dto.NewBoard(&res), err
}

func (r *boardrepo) ListBoardsByUser(ctx context.Context, userId *int32) ([]schemas.BoardWithOwner, error) {
	res, err := r.queries.ListBoardsByUser(ctx, pgtype.Int4{
		Int32: *userId,
		Valid: true,
	})
	if err != nil {
		return nil, err
	}

	boards := make([]schemas.BoardWithOwner, len(res))
	for i, board := range res {
		boards[i] = schemas.BoardWithOwner{
			ID:            board.ID,
			Name:          board.Name,
			OwnerID:       board.OwnerID.Int32,
			CreatedAt:     board.CreatedAt.Time,
			OwnerUsername: board.OwnerUsername,
		}
	}
	return boards, nil
}

func (r *boardrepo) UpdateBoard(ctx context.Context, id *int32, name *string) (*schemas.Board, error) {
	res, err := r.queries.UpdateBoard(ctx, sqlc.UpdateBoardParams{
		ID:   *id,
		Name: *name,
	})
	if err != nil {
		return nil, err
	}
	return &schemas.Board{
		ID:      res.ID,
		Name:    res.Name,
		OwnerID: res.OwnerID,
	}, nil
}

func (r *boardrepo) DeleteBoard(ctx context.Context, id *int32) error {
	return r.queries.DeleteBoard(ctx, *id)
}

func (r *boardrepo) CountBoardMembers(ctx context.Context, boardId *int32) (int64, error) {
	return r.queries.CountBoardMembers(ctx, pgtype.Int4{
		Int32: *boardId,
		Valid: true,
	})
}
