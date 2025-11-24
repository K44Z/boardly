package repository

import (
	"context"

	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/internal/label"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgtype"
)

type LabelRepository struct {
	db *sqlc.Queries
}

func NewLabelRepository(db *schemas.DB) *LabelRepository {
	return &LabelRepository{db: sqlc.New(db.DBTX)}
}

// Label CRUD operations
func (r *LabelRepository) CreateLabel(ctx context.Context, l *schemas.Label) (*schemas.Label, error) {
	labelData, err := r.db.CreateLabel(ctx, sqlc.CreateLabelParams{
		BoardID: pgtype.Int4{Int32: l.BoardID, Valid: true},
		Name:    l.Name,
		Color:   l.Color,
	})
	if err != nil {
		return nil, err
	}
	return label.NewLabel(&labelData), nil
}

func (r *LabelRepository) GetLabelByID(ctx context.Context, id int32) (*schemas.Label, error) {
	labelData, err := r.db.GetLabelByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return label.NewLabel(&labelData), nil
}

func (r *LabelRepository) GetLabelsByBoard(ctx context.Context, boardID int32) ([]schemas.Label, error) {
	labels, err := r.db.GetLabelsByBoard(ctx, pgtype.Int4{Int32: boardID, Valid: true})
	if err != nil {
		return nil, err
	}
	return label.NewLabels(labels), nil
}

func (r *LabelRepository) GetLabelWithCardCount(ctx context.Context, id int32) (*schemas.LabelWithCount, error) {
	result, err := r.db.GetLabelWithCardCount(ctx, id)
	if err != nil {
		return nil, err
	}
	return &schemas.LabelWithCount{
		ID:        result.ID,
		BoardID:   result.BoardID.Int32,
		Name:      result.Name,
		Color:     result.Color,
		CardCount: int(result.CardCount),
	}, nil
}

func (r *LabelRepository) GetLabelsWithCardCount(ctx context.Context, boardID int32) ([]schemas.LabelWithCount, error) {
	results, err := r.db.GetLabelsWithCardCount(ctx, pgtype.Int4{Int32: boardID, Valid: true})
	if err != nil {
		return nil, err
	}

	var labels []schemas.LabelWithCount
	for _, result := range results {
		labels = append(labels, schemas.LabelWithCount{
			ID:        result.ID,
			BoardID:   result.BoardID.Int32,
			Name:      result.Name,
			Color:     result.Color,
			CardCount: int(result.CardCount),
		})
	}
	return labels, nil
}

func (r *LabelRepository) UpdateLabel(ctx context.Context, id int32, name, color string) (*schemas.Label, error) {
	labelData, err := r.db.UpdateLabel(ctx, sqlc.UpdateLabelParams{
		ID:    id,
		Name:  name,
		Color: color,
	})
	if err != nil {
		return nil, err
	}
	return label.NewLabel(&labelData), nil
}

func (r *LabelRepository) UpdateLabelName(ctx context.Context, id int32, name string) (*schemas.Label, error) {
	labelData, err := r.db.UpdateLabelName(ctx, sqlc.UpdateLabelNameParams{
		ID:   id,
		Name: name,
	})
	if err != nil {
		return nil, err
	}
	return label.NewLabel(&labelData), nil
}

func (r *LabelRepository) UpdateLabelColor(ctx context.Context, id int32, color string) (*schemas.Label, error) {
	labelData, err := r.db.UpdateLabelColor(ctx, sqlc.UpdateLabelColorParams{
		ID:    id,
		Color: color,
	})
	if err != nil {
		return nil, err
	}
	return label.NewLabel(&labelData), nil
}

func (r *LabelRepository) DeleteLabel(ctx context.Context, id int32) error {
	return r.db.DeleteLabel(ctx, id)
}

func (r *LabelRepository) SearchLabels(ctx context.Context, boardID int32, query string) ([]schemas.Label, error) {
	labels, err := r.db.SearchLabels(ctx, sqlc.SearchLabelsParams{
		BoardID: pgtype.Int4{Int32: boardID, Valid: true},
		Column2: query,
	})
	if err != nil {
		return nil, err
	}
	return label.NewLabels(labels), nil
}

func (r *LabelRepository) GetLabelsByColor(ctx context.Context, boardID int32, color string) ([]schemas.Label, error) {
	labels, err := r.db.GetLabelsByColor(ctx, sqlc.GetLabelsByColorParams{
		BoardID: pgtype.Int4{Int32: boardID, Valid: true},
		Color:   color,
	})
	if err != nil {
		return nil, err
	}
	return label.NewLabels(labels), nil
}

func (r *LabelRepository) CountLabelsByBoard(ctx context.Context, boardID int32) (int64, error) {
	return r.db.CountLabelsByBoard(ctx, pgtype.Int4{Int32: boardID, Valid: true})
}

func (r *LabelRepository) GetMostUsedLabels(ctx context.Context, boardID int32, limit int32) ([]schemas.LabelWithCount, error) {
	results, err := r.db.GetMostUsedLabels(ctx, sqlc.GetMostUsedLabelsParams{
		BoardID: pgtype.Int4{Int32: boardID, Valid: true},
		Limit:   limit,
	})
	if err != nil {
		return nil, err
	}

	var labels []schemas.LabelWithCount
	for _, result := range results {
		labels = append(labels, schemas.LabelWithCount{
			ID:        result.ID,
			BoardID:   result.BoardID.Int32,
			Name:      result.Name,
			Color:     result.Color,
			CardCount: int(result.UsageCount),
		})
	}
	return labels, nil
}

// Card Label operations
func (r *LabelRepository) AddLabelToCard(ctx context.Context, cardID, labelID int32) error {
	return r.db.AddLabelToCard(ctx, sqlc.AddLabelToCardParams{
		CardID:  cardID,
		LabelID: labelID,
	})
}

func (r *LabelRepository) RemoveLabelFromCard(ctx context.Context, cardID, labelID int32) error {
	return r.db.RemoveLabelFromCard(ctx, sqlc.RemoveLabelFromCardParams{
		CardID:  cardID,
		LabelID: labelID,
	})
}

func (r *LabelRepository) GetCardLabels(ctx context.Context, cardID int32) ([]schemas.Label, error) {
	labels, err := r.db.GetCardLabels(ctx, cardID)
	if err != nil {
		return nil, err
	}
	return label.NewLabels(labels), nil
}

func (r *LabelRepository) GetLabelCards(ctx context.Context, labelID int32) ([]schemas.CardWithList, error) {
	results, err := r.db.GetLabelCards(ctx, labelID)
	if err != nil {
		return nil, err
	}

	var cards []schemas.CardWithList
	for _, result := range results {
		var dueDate *string
		if result.DueDate.Valid {
			dateStr := result.DueDate.Time.Format("2006-01-02T15:04:05Z")
			dueDate = &dateStr
		}

		description := result.Description
		cards = append(cards, schemas.CardWithList{
			ID:          result.ID,
			ListID:      result.ListID.Int32,
			Title:       result.Title,
			Description: &description,
			Position:    result.Position,
			DueDate:     dueDate,
			ListName:    result.ListName,
			BoardID:     result.BoardID.Int32,
		})
	}
	return cards, nil
}

func (r *LabelRepository) RemoveAllLabelsFromCard(ctx context.Context, cardID int32) error {
	return r.db.RemoveAllLabelsFromCard(ctx, cardID)
}

func (r *LabelRepository) CheckCardHasLabel(ctx context.Context, cardID, labelID int32) (bool, error) {
	result, err := r.db.CheckCardHasLabel(ctx, sqlc.CheckCardHasLabelParams{
		CardID:  cardID,
		LabelID: labelID,
	})
	if err != nil {
		return false, err
	}
	return result, nil
}
