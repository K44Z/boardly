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
