package label

import (
	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/shared/schemas"
)

func NewLabel(l *sqlc.Label) *schemas.Label {
	return &schemas.Label{
		ID:      l.ID,
		BoardID: l.BoardID.Int32,
		Name:    l.Name,
		Color:   l.Color,
	}
}

func NewLabels(labels []sqlc.Label) []schemas.Label {
	var result []schemas.Label
	for _, l := range labels {
		result = append(result, *NewLabel(&l))
	}
	return result
}
