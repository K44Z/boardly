package repository

import (
	"context"
	"errors"

	sqlc "github.com/K44Z/boardly/database/generated"
	dto "github.com/K44Z/boardly/internal/card"
	userDto "github.com/K44Z/boardly/internal/user"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/K44Z/boardly/shared/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type CardRepository interface {
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
	ReorderCardsAfterDelete(ctx context.Context, listID int32, position int32) error
	GetOverdueCards(ctx context.Context) ([]schemas.CardWithDetails, error)
	GetCardsDueSoon(ctx context.Context) ([]schemas.CardWithDetails, error)
	SearchCards(ctx context.Context, query string) ([]schemas.CardWithDetails, error)
	CountCardsByList(ctx context.Context, listID int32) (int64, error)
	GetCardList(ctx context.Context, id int32) (int32, error)
	AssignUser(ctx context.Context, userId int32, cardId int32) error
	GetAllAssignees(ctx context.Context, cardId int32) ([]schemas.User, error)
}

type cardRepository struct {
	queries *sqlc.Queries
}

func NewCardRepository(db *schemas.DB) CardRepository {
	return &cardRepository{
		queries: sqlc.New(db.DBTX),
	}
}

func (r *cardRepository) CreateCard(ctx context.Context, listID int32, title, description string, position int32, dueDate *pgtype.Timestamp) (*schemas.Card, error) {
	var dueDateParam pgtype.Timestamp
	if dueDate != nil {
		dueDateParam = *dueDate
	}

	card, err := r.queries.CreateCard(ctx, sqlc.CreateCardParams{
		ListID:      pgtype.Int4{Int32: listID, Valid: true},
		Title:       title,
		Description: description,
		Position:    position,
		DueDate:     dueDateParam,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewCard(&card), nil
}

func (r *cardRepository) GetCardByID(ctx context.Context, id int32) (*schemas.Card, error) {
	card, err := r.queries.GetCardByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return dto.NewCard(&card), nil
}

func (r *cardRepository) GetCardWithDetails(ctx context.Context, id int32) (*schemas.CardWithDetails, error) {
	card, err := r.queries.GetCardWithDetails(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return dto.NewCardWithDetails(&card), nil
}

func (r *cardRepository) GetCardsByList(ctx context.Context, listID int32) ([]schemas.Card, error) {
	cards, err := r.queries.GetCardsByList(ctx, pgtype.Int4{Int32: listID, Valid: true})
	if err != nil {
		return nil, err
	}
	return dto.NewCards(cards), nil
}

func (r *cardRepository) GetCardsByBoard(ctx context.Context, boardID int32) ([]schemas.CardWithDetails, error) {
	cards, err := r.queries.GetCardsByBoard(ctx, pgtype.Int4{Int32: boardID, Valid: true})
	if err != nil {
		return nil, err
	}
	var result []schemas.CardWithDetails
	for _, card := range cards {
		result = append(result, *dto.NewCardsByBoard(&card))
	}
	return result, nil
}

func (r *cardRepository) UpdateCard(ctx context.Context, id int32, title, description string, dueDate *pgtype.Timestamp) (*schemas.Card, error) {
	var dueDateParam pgtype.Timestamp
	if dueDate != nil {
		dueDateParam = *dueDate
	}

	card, err := r.queries.UpdateCard(ctx, sqlc.UpdateCardParams{
		ID:          id,
		Title:       title,
		Description: description,
		DueDate:     dueDateParam,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewCard(&card), nil
}

func (r *cardRepository) UpdateCardTitle(ctx context.Context, id int32, title string) (*schemas.Card, error) {
	card, err := r.queries.UpdateCardTitle(ctx, sqlc.UpdateCardTitleParams{
		ID:    id,
		Title: title,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewCard(&card), nil
}

func (r *cardRepository) UpdateCardDescription(ctx context.Context, id int32, description string) (*schemas.Card, error) {
	card, err := r.queries.UpdateCardDescription(ctx, sqlc.UpdateCardDescriptionParams{
		ID:          id,
		Description: description,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewCard(&card), nil
}

func (r *cardRepository) UpdateCardDueDate(ctx context.Context, id int32, dueDate *pgtype.Timestamp) (*schemas.Card, error) {
	var dueDateParam pgtype.Timestamp
	if dueDate != nil {
		dueDateParam = *dueDate
	}

	card, err := r.queries.UpdateCardDueDate(ctx, sqlc.UpdateCardDueDateParams{
		ID:      id,
		DueDate: dueDateParam,
	})
	if err != nil {
		return nil, err
	}
	return dto.NewCard(&card), nil
}

func (r *cardRepository) UpdateCardPosition(ctx context.Context, id int32, position int32) error {
	return r.queries.UpdateCardPosition(ctx, sqlc.UpdateCardPositionParams{
		ID:       id,
		Position: position,
	})
}

func (r *cardRepository) MoveCard(ctx context.Context, id int32, listID int32, position int32) error {
	return r.queries.MoveCard(ctx, sqlc.MoveCardParams{
		ID:       id,
		ListID:   pgtype.Int4{Int32: listID, Valid: true},
		Position: position,
	})
}

func (r *cardRepository) DeleteCard(ctx context.Context, id int32) error {
	return r.queries.DeleteCard(ctx, id)
}

func (r *cardRepository) GetMaxCardPosition(ctx context.Context, listID int32) (int32, error) {
	result, err := r.queries.GetMaxCardPosition(ctx, pgtype.Int4{Int32: listID, Valid: true})
	if err != nil {
		return 0, err
	}
	if pos, ok := result.(int32); ok {
		return pos, nil
	}
	return -1, nil
}

func (r *cardRepository) ReorderCardsAfterDelete(ctx context.Context, listID int32, position int32) error {
	return r.queries.ReorderCardsAfterDelete(ctx, sqlc.ReorderCardsAfterDeleteParams{
		ListID:   pgtype.Int4{Int32: listID, Valid: true},
		Position: position,
	})
}

func (r *cardRepository) GetOverdueCards(ctx context.Context) ([]schemas.CardWithDetails, error) {
	cards, err := r.queries.GetOverdueCards(ctx)
	if err != nil {
		return nil, err
	}
	var result []schemas.CardWithDetails
	for _, card := range cards {
		result = append(result, *dto.NewOverdueCard(&card))
	}
	return result, nil
}

func (r *cardRepository) GetCardsDueSoon(ctx context.Context) ([]schemas.CardWithDetails, error) {
	cards, err := r.queries.GetCardsDueSoon(ctx)
	if err != nil {
		return nil, err
	}
	var result []schemas.CardWithDetails
	for _, card := range cards {
		result = append(result, *dto.NewCardDueSoon(&card))
	}
	return result, nil
}

func (r *cardRepository) SearchCards(ctx context.Context, query string) ([]schemas.CardWithDetails, error) {
	cards, err := r.queries.SearchCards(ctx, query)
	if err != nil {
		return nil, err
	}
	var result []schemas.CardWithDetails
	for _, card := range cards {
		result = append(result, *dto.NewSearchCard(&card))
	}
	return result, nil
}

func (r *cardRepository) CountCardsByList(ctx context.Context, listID int32) (int64, error) {
	return r.queries.CountCardsByList(ctx, pgtype.Int4{Int32: listID, Valid: true})
}

func (r *cardRepository) GetCardList(ctx context.Context, id int32) (int32, error) {
	result, err := r.queries.GetCardList(ctx, id)
	if err != nil {
		return 0, err
	}
	return result.Int32, nil
}

func (r *cardRepository) AssignUser(ctx context.Context, userId int32, cardId int32) error {
	err := r.queries.AssignUserToCard(ctx, sqlc.AssignUserToCardParams{
		CardID: cardId,
		UserID: userId,
	})
	if err != nil {
		return err
	}
	return nil
}

func (r *cardRepository) GetAllAssignees(ctx context.Context, cardId int32) ([]schemas.User, error) {
	assignees, err := r.queries.GetCardAssignees(ctx, cardId)
	if err != nil {
		return nil, err
	}
	return userDto.NewUsers(assignees), err
}
