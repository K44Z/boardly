package repository

import (
	"context"

	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgtype"
)

type AnalyticsRepository interface {
	GetBoardStats(ctx context.Context, boardId int32) (sqlc.GetBoardStatsRow, error)
	GetBoardActivity(ctx context.Context, boardId int32) ([]sqlc.GetBoardActivityRow, error)
	GetCardsPerList(ctx context.Context, boardId int32) ([]sqlc.GetCardsPerListRow, error)
	GetCardsPerMember(ctx context.Context, boardId int32) ([]sqlc.GetCardsPerMemberRow, error)
}

type analyticsRepo struct {
	queries *sqlc.Queries
}

func NewAnalyticsRepo(db *schemas.DB) AnalyticsRepository {
	return &analyticsRepo{
		queries: sqlc.New(db.DBTX),
	}
}

func (r *analyticsRepo) GetBoardStats(ctx context.Context, boardId int32) (sqlc.GetBoardStatsRow, error) {
	return r.queries.GetBoardStats(ctx, boardId)
}

func (r *analyticsRepo) GetBoardActivity(ctx context.Context, boardId int32) ([]sqlc.GetBoardActivityRow, error) {
	return r.queries.GetBoardActivity(ctx, boardId)
}

func (r *analyticsRepo) GetCardsPerList(ctx context.Context, boardId int32) ([]sqlc.GetCardsPerListRow, error) {
	return r.queries.GetCardsPerList(ctx, pgtype.Int4{Int32: boardId, Valid: true})
}

func (r *analyticsRepo) GetCardsPerMember(ctx context.Context, boardId int32) ([]sqlc.GetCardsPerMemberRow, error) {
	return r.queries.GetCardsPerMember(ctx, pgtype.Int4{Int32: boardId, Valid: true})
}
