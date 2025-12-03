package services

import (
	"context"

	"github.com/K44Z/boardly/internal/card/repository"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgtype"
)

type CardService interface {
	CreateCard(ctx context.Context, listID int32, title, description string, position int32, dueDate *pgtype.Timestamp) (*schemas.Card, error)
	GetCardByID(ctx context.Context, id int32) (*schemas.Card, error)
	GetCardWithDetails(ctx context.Context, id int32) (*schemas.CardWithDetails, error)
	GetCardsByList(ctx context.Context, listID int32) ([]schemas.Card, error)
	GetCardsByBoard(ctx context.Context, boardID int32) ([]schemas.CardWithDetails, error)
	UpdateCard(ctx context.Context, id int32, title, description string, dueDate *pgtype.Timestamp) (*schemas.Card, error)
	UpdateCardTitle(ctx context.Context, id int32, title string) (*schemas.Card, error)
	UpdateCardDescription(ctx context.Context, id int32, description string) (*schemas.Card, error)
	UpdateCardDueDate(ctx context.Context, id int32, dueDate *pgtype.Timestamp) (*schemas.Card, error)
	UpdateCardPosition(ctx context.Context, id int32, position int32) error
	MoveCard(ctx context.Context, id int32, listID int32, position int32) error
	DeleteCard(ctx context.Context, id int32) error
	GetMaxCardPosition(ctx context.Context, listID int32) (int32, error)
	GetOverdueCards(ctx context.Context) ([]schemas.CardWithDetails, error)
	GetCardsDueSoon(ctx context.Context) ([]schemas.CardWithDetails, error)
	SearchCards(ctx context.Context, query string) ([]schemas.CardWithDetails, error)
	CountCardsByList(ctx context.Context, listID int32) (int64, error)
	AssignUserToCard(ctx context.Context, userId int32, cardId int32) error
	GetAllCardAssignees(ctx context.Context, cardId int32) ([]schemas.User, error)
	UnAssignUserFromCard(ctx context.Context, cardId int32, userId int32) error
}

type cardService struct {
	repo repository.CardRepository
}

func NewCardService(db *schemas.DB) CardService {
	return &cardService{
		repo: repository.NewCardRepository(db),
	}
}

func (s *cardService) CreateCard(ctx context.Context, listID int32, title, description string, position int32, dueDate *pgtype.Timestamp) (*schemas.Card, error) {
	return s.repo.CreateCard(ctx, listID, title, description, position, dueDate)
}

func (s *cardService) GetCardByID(ctx context.Context, id int32) (*schemas.Card, error) {
	return s.repo.GetCardByID(ctx, id)
}

func (s *cardService) GetCardWithDetails(ctx context.Context, id int32) (*schemas.CardWithDetails, error) {
	return s.repo.GetCardWithDetails(ctx, id)
}

func (s *cardService) GetCardsByList(ctx context.Context, listID int32) ([]schemas.Card, error) {
	return s.repo.GetCardsByList(ctx, listID)
}

func (s *cardService) GetCardsByBoard(ctx context.Context, boardID int32) ([]schemas.CardWithDetails, error) {
	return s.repo.GetCardsByBoard(ctx, boardID)
}

func (s *cardService) UpdateCard(ctx context.Context, id int32, title, description string, dueDate *pgtype.Timestamp) (*schemas.Card, error) {
	return s.repo.UpdateCard(ctx, id, title, description, dueDate)
}

func (s *cardService) UpdateCardTitle(ctx context.Context, id int32, title string) (*schemas.Card, error) {
	return s.repo.UpdateCardTitle(ctx, id, title)
}

func (s *cardService) UpdateCardDescription(ctx context.Context, id int32, description string) (*schemas.Card, error) {
	return s.repo.UpdateCardDescription(ctx, id, description)
}

func (s *cardService) UpdateCardDueDate(ctx context.Context, id int32, dueDate *pgtype.Timestamp) (*schemas.Card, error) {
	return s.repo.UpdateCardDueDate(ctx, id, dueDate)
}

func (s *cardService) UpdateCardPosition(ctx context.Context, id int32, position int32) error {
	return s.repo.UpdateCardPosition(ctx, id, position)
}

func (s *cardService) MoveCard(ctx context.Context, id int32, listID int32, position int32) error {
	return s.repo.MoveCard(ctx, id, listID, position)
}

func (s *cardService) DeleteCard(ctx context.Context, id int32) error {
	return s.repo.DeleteCard(ctx, id)
}

func (s *cardService) GetMaxCardPosition(ctx context.Context, listID int32) (int32, error) {
	return s.repo.GetMaxCardPosition(ctx, listID)
}

func (s *cardService) GetOverdueCards(ctx context.Context) ([]schemas.CardWithDetails, error) {
	return s.repo.GetOverdueCards(ctx)
}

func (s *cardService) GetCardsDueSoon(ctx context.Context) ([]schemas.CardWithDetails, error) {
	return s.repo.GetCardsDueSoon(ctx)
}

func (s *cardService) SearchCards(ctx context.Context, query string) ([]schemas.CardWithDetails, error) {
	return s.repo.SearchCards(ctx, query)
}

func (s *cardService) CountCardsByList(ctx context.Context, listID int32) (int64, error) {
	return s.repo.CountCardsByList(ctx, listID)
}

func (s *cardService) AssignUserToCard(ctx context.Context, userId int32, cardId int32) error {
	return s.repo.AssignUser(ctx, userId, cardId)
}

func (s *cardService) GetAllCardAssignees(ctx context.Context, cardId int32) ([]schemas.User, error) {
	return s.repo.GetAllAssignees(ctx, cardId)
}

func (s *cardService) UnAssignUserFromCard(ctx context.Context, cardId int32, userId int32) error {
	return s.repo.UnassignUser(ctx, cardId, userId)
}
