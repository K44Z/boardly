package card

import (
	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgtype"
)

func NewCard(c *sqlc.Card) *schemas.Card {
	var description *string
	if c.Description != "" {
		description = &c.Description
	}

	var dueDate *pgtype.Timestamp
	if c.DueDate.Valid {
		dueDate = &c.DueDate
	}

	return &schemas.Card{
		ID:          c.ID,
		ListID:      c.ListID.Int32,
		Title:       c.Title,
		Description: description,
		Position:    c.Position,
		DueDate:     dueDate,
	}
}

func NewCards(cards []sqlc.Card) []schemas.Card {
	var result []schemas.Card
	for _, c := range cards {
		result = append(result, *NewCard(&c))
	}
	return result
}

func NewLabel(label *sqlc.Label) *schemas.Label {
	return &schemas.Label{
		ID:      label.ID,
		BoardID: label.BoardID.Int32,
		Name:    label.Name,
		Color:   label.Color,
	}
}
func NewLabels(labels []sqlc.Label) []schemas.Label {
	var result []schemas.Label
	for _, c := range labels {
		result = append(result, *NewLabel(&c))
	}
	return result
}
func NewCardWithDetails(c *sqlc.GetCardWithDetailsRow) *schemas.CardWithDetails {
	var description *string
	if c.Description != "" {
		description = &c.Description
	}

	var dueDate *pgtype.Timestamp
	if c.DueDate.Valid {
		dueDate = &c.DueDate
	}

	return &schemas.CardWithDetails{
		ID:          c.ID,
		ListID:      c.ListID.Int32,
		Title:       c.Title,
		Description: description,
		Position:    c.Position,
		DueDate:     dueDate,
		ListName:    c.ListName,
		BoardID:     c.BoardID.Int32,
	}
}

func NewCardsByBoard(c *sqlc.GetCardsByBoardRow) *schemas.CardWithDetails {
	var description *string
	if c.Description != "" {
		description = &c.Description
	}

	var dueDate *pgtype.Timestamp
	if c.DueDate.Valid {
		dueDate = &c.DueDate
	}

	return &schemas.CardWithDetails{
		ID:          c.ID,
		ListID:      c.ListID.Int32,
		Title:       c.Title,
		Description: description,
		Position:    c.Position,
		DueDate:     dueDate,
		ListName:    c.ListName,
		BoardID:     0, // Board ID not available in this query
	}
}

func NewOverdueCard(c *sqlc.GetOverdueCardsRow) *schemas.CardWithDetails {
	var description *string
	if c.Description != "" {
		description = &c.Description
	}

	var dueDate *pgtype.Timestamp
	if c.DueDate.Valid {
		dueDate = &c.DueDate
	}

	return &schemas.CardWithDetails{
		ID:          c.ID,
		ListID:      c.ListID.Int32,
		Title:       c.Title,
		Description: description,
		Position:    c.Position,
		DueDate:     dueDate,
		ListName:    c.ListName,
		BoardID:     c.BoardID.Int32,
	}
}

func NewCardDueSoon(c *sqlc.GetCardsDueSoonRow) *schemas.CardWithDetails {
	var description *string
	if c.Description != "" {
		description = &c.Description
	}

	var dueDate *pgtype.Timestamp
	if c.DueDate.Valid {
		dueDate = &c.DueDate
	}

	return &schemas.CardWithDetails{
		ID:          c.ID,
		ListID:      c.ListID.Int32,
		Title:       c.Title,
		Description: description,
		Position:    c.Position,
		DueDate:     dueDate,
		ListName:    c.ListName,
		BoardID:     c.BoardID.Int32,
	}
}

func NewSearchCard(c *sqlc.SearchCardsRow) *schemas.CardWithDetails {
	var description *string
	if c.Description != "" {
		description = &c.Description
	}

	var dueDate *pgtype.Timestamp
	if c.DueDate.Valid {
		dueDate = &c.DueDate
	}

	return &schemas.CardWithDetails{
		ID:          c.ID,
		ListID:      c.ListID.Int32,
		Title:       c.Title,
		Description: description,
		Position:    c.Position,
		DueDate:     dueDate,
		ListName:    c.ListName,
		BoardID:     c.BoardID.Int32,
	}
}
