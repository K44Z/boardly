package services

import (
	"context"

	"github.com/K44Z/boardly/internal/label/repository"
	"github.com/K44Z/boardly/shared/schemas"
)

type LabelService struct {
	repo *repository.LabelRepository
}

func NewLabelService(db *schemas.DB) *LabelService {
	return &LabelService{repo: repository.NewLabelRepository(db)}
}

// Label CRUD operations
func (s *LabelService) CreateLabel(ctx context.Context, label *schemas.Label) (*schemas.Label, error) {
	return s.repo.CreateLabel(ctx, label)
}

func (s *LabelService) GetLabelByID(ctx context.Context, id int32) (*schemas.Label, error) {
	return s.repo.GetLabelByID(ctx, id)
}

func (s *LabelService) GetLabelsByBoard(ctx context.Context, boardID int32) ([]schemas.Label, error) {
	return s.repo.GetLabelsByBoard(ctx, boardID)
}

func (s *LabelService) GetLabelWithCardCount(ctx context.Context, id int32) (*schemas.LabelWithCount, error) {
	return s.repo.GetLabelWithCardCount(ctx, id)
}

func (s *LabelService) GetLabelsWithCardCount(ctx context.Context, boardID int32) ([]schemas.LabelWithCount, error) {
	return s.repo.GetLabelsWithCardCount(ctx, boardID)
}

func (s *LabelService) UpdateLabel(ctx context.Context, id int32, name, color string) (*schemas.Label, error) {
	return s.repo.UpdateLabel(ctx, id, name, color)
}

func (s *LabelService) UpdateLabelName(ctx context.Context, id int32, name string) (*schemas.Label, error) {
	return s.repo.UpdateLabelName(ctx, id, name)
}

func (s *LabelService) UpdateLabelColor(ctx context.Context, id int32, color string) (*schemas.Label, error) {
	return s.repo.UpdateLabelColor(ctx, id, color)
}

func (s *LabelService) DeleteLabel(ctx context.Context, id int32) error {
	return s.repo.DeleteLabel(ctx, id)
}

func (s *LabelService) SearchLabels(ctx context.Context, boardID int32, query string) ([]schemas.Label, error) {
	return s.repo.SearchLabels(ctx, boardID, query)
}

func (s *LabelService) GetLabelsByColor(ctx context.Context, boardID int32, color string) ([]schemas.Label, error) {
	return s.repo.GetLabelsByColor(ctx, boardID, color)
}

func (s *LabelService) CountLabelsByBoard(ctx context.Context, boardID int32) (int64, error) {
	return s.repo.CountLabelsByBoard(ctx, boardID)
}

func (s *LabelService) GetMostUsedLabels(ctx context.Context, boardID int32, limit int32) ([]schemas.LabelWithCount, error) {
	return s.repo.GetMostUsedLabels(ctx, boardID, limit)
}

// Card Label operations
func (s *LabelService) AddLabelToCard(ctx context.Context, cardID, labelID int32) error {
	return s.repo.AddLabelToCard(ctx, cardID, labelID)
}

func (s *LabelService) RemoveLabelFromCard(ctx context.Context, cardID, labelID int32) error {
	return s.repo.RemoveLabelFromCard(ctx, cardID, labelID)
}

func (s *LabelService) GetCardLabels(ctx context.Context, cardID int32) ([]schemas.Label, error) {
	return s.repo.GetCardLabels(ctx, cardID)
}

func (s *LabelService) GetLabelCards(ctx context.Context, labelID int32) ([]schemas.CardWithList, error) {
	return s.repo.GetLabelCards(ctx, labelID)
}

func (s *LabelService) RemoveAllLabelsFromCard(ctx context.Context, cardID int32) error {
	return s.repo.RemoveAllLabelsFromCard(ctx, cardID)
}

func (s *LabelService) CheckCardHasLabel(ctx context.Context, cardID, labelID int32) (bool, error) {
	return s.repo.CheckCardHasLabel(ctx, cardID, labelID)
}

func (s *LabelService) GetAllLabels(ctx context.Context) ([]schemas.Label, error) {
	return s.repo.GetAll(ctx)
}

