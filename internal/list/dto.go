package list

import (
	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/shared/schemas"
)

func NewList(l *sqlc.List) *schemas.List {
	return &schemas.List{
		ID:       l.ID,
		BoardID:  l.BoardID.Int32,
		Name:     l.Name,
		Position: l.Position,
	}
}

func NewLists(lists []sqlc.List) []schemas.List {
	var result []schemas.List
	for _, l := range lists {
		result = append(result, schemas.List{
			ID:       l.ID,
			BoardID:  l.BoardID.Int32,
			Name:     l.Name,
			Position: l.Position,
		})
	}
	return result
}

func NewListWithCardCount(l *sqlc.GetListWithCardCountRow) *schemas.ListWithCardCount {
	return &schemas.ListWithCardCount{
		ID:        l.ID,
		BoardID:   l.BoardID.Int32,
		Name:      l.Name,
		Position:  l.Position,
		CardCount: int(l.CardCount),
	}
}

func NewListsWithCardCount(lists []sqlc.GetListsWithCardCountRow) []schemas.ListWithCardCount {
	var result []schemas.ListWithCardCount
	for _, l := range lists {
		result = append(result, schemas.ListWithCardCount{
			ID:        l.ID,
			BoardID:   l.BoardID.Int32,
			Name:      l.Name,
			Position:  l.Position,
			CardCount: int(l.CardCount),
		})
	}
	return result
}
