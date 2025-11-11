package repository

import (
	"context"
	"errors"

	sqlc "github.com/K44Z/boardly/database/generated"
	dto "github.com/K44Z/boardly/internal/list"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/K44Z/boardly/shared/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type ListRepository interface {
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

type listRepository struct {
	queries *sqlc.Queries
}

func NewListRepository(db *schemas.DB) ListRepository {
	return &listRepository{
		queries: sqlc.New(db.DBTX),
	}
}

func (r *listRepository) CreateList(ctx context.Context, boardID int32, name string, position int32) (*schemas.List, error) {
	list, err := r.queries.CreateList(ctx, sqlc.CreateListParams{
		BoardID:  pgtype.Int4{Int32: boardID, Valid: true},
		Name:     name,
		Position: position,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewList(&list), nil
}

func (r *listRepository) GetListByID(ctx context.Context, id int32) (*schemas.List, error) {
	list, err := r.queries.GetListByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return dto.NewList(&list), nil
}

func (r *listRepository) GetListsByBoard(ctx context.Context, boardID int32) ([]schemas.List, error) {
	lists, err := r.queries.GetListsByBoard(ctx, pgtype.Int4{Int32: boardID, Valid: true})
	if err != nil {
		return nil, err
	}
	return dto.NewLists(lists), nil
}

func (r *listRepository) GetListWithCardCount(ctx context.Context, id int32) (*schemas.ListWithCardCount, error) {
	list, err := r.queries.GetListWithCardCount(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return dto.NewListWithCardCount(&list), nil
}

func (r *listRepository) GetListsWithCardCount(ctx context.Context, boardID int32) ([]schemas.ListWithCardCount, error) {
	lists, err := r.queries.GetListsWithCardCount(ctx, pgtype.Int4{Int32: boardID, Valid: true})
	if err != nil {
		return nil, err
	}
	return dto.NewListsWithCardCount(lists), nil
}

func (r *listRepository) UpdateListTitle(ctx context.Context, id int32, name string) (*schemas.List, error) {
	list, err := r.queries.UpdateListTitle(ctx, sqlc.UpdateListTitleParams{
		ID:   id,
		Name: name,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewList(&list), nil
}

func (r *listRepository) UpdateListPosition(ctx context.Context, id int32, position int32) error {
	return r.queries.UpdateListPosition(ctx, sqlc.UpdateListPositionParams{
		ID:       id,
		Position: position,
	})
}

func (r *listRepository) UpdateListPositions(ctx context.Context, ids []int32, boardID int32) error {
	return r.queries.UpdateListPositions(ctx, sqlc.UpdateListPositionsParams{
		Column1: ids,
		BoardID: pgtype.Int4{Int32: boardID, Valid: true},
	})
}

func (r *listRepository) DeleteList(ctx context.Context, id int32) error {
	return r.queries.DeleteList(ctx, id)
}

func (r *listRepository) GetMaxListPosition(ctx context.Context, boardID int32) (int32, error) {
	result, err := r.queries.GetMaxListPosition(ctx, pgtype.Int4{Int32: boardID, Valid: true})
	if err != nil {
		return 0, err
	}
	if pos, ok := result.(int32); ok {
		return pos, nil
	}
	return -1, nil
}

func (r *listRepository) ReorderListsAfterDelete(ctx context.Context, boardID int32, position int32) error {
	return r.queries.ReorderListsAfterDelete(ctx, sqlc.ReorderListsAfterDeleteParams{
		BoardID:  pgtype.Int4{Int32: boardID, Valid: true},
		Position: position,
	})
}

func (r *listRepository) CountListsByBoard(ctx context.Context, boardID int32) (int64, error) {
	return r.queries.CountListsByBoard(ctx, pgtype.Int4{Int32: boardID, Valid: true})
}

func (r *listRepository) GetListBoard(ctx context.Context, id int32) (int32, error) {
	result, err := r.queries.GetListBoard(ctx, id)
	if err != nil {
		return 0, err
	}
	return result.Int32, nil
}
