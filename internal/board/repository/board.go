package repository

import (
	"context"
	"errors"

	sqlc "github.com/K44Z/boardly/database/generated"
	dto "github.com/K44Z/boardly/internal/user"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgtype"
)

type BoardRepository interface {
	Create(ctx context.Context, name *string, ownerId *int32) (*schemas.Board, error)
	GetById(ctx context.Context, id *int32) (*schemas.Board, error)
	GetBoardWithOwner(ctx context.Context, id *int32) (*schemas.Board, error)
	ListBoardsByUser(ctx context.Context, userId *int32) ([]schemas.BoardWithOwner, error)
	UpdateBoard(ctx context.Context, id *int32, name *string) (*schemas.Board, error)
	DeleteBoard(ctx context.Context, id *int32) error
	CountBoardMembers(ctx context.Context, boardId *int32) (int64, error)
	GetBoardWithListsAndCards(ctx context.Context, boardId *int32) (*schemas.BoardWithListsAndCards, error)
	GetBoardMembers(ctx context.Context, boardId *int32) ([]schemas.User, error)
	AddMember(ctx context.Context, boardId *int32, userId *int32) error
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

func (r *boardrepo) ListBoardsByUser(ctx context.Context, userId *int32) ([]schemas.BoardWithOwner, error) {
	res, err := r.queries.ListBoardsByUser(ctx, pgtype.Int4{
		Int32: *userId,
		Valid: true,
	})
	if err != nil {
		return nil, err
	}

	boards := make([]schemas.BoardWithOwner, len(res))
	for i, board := range res {
		boards[i] = schemas.BoardWithOwner{
			ID:            board.ID,
			Name:          board.Name,
			OwnerID:       board.OwnerID.Int32,
			CreatedAt:     board.CreatedAt.Time,
			OwnerUsername: board.OwnerUsername,
		}
	}
	return boards, nil
}

func (r *boardrepo) UpdateBoard(ctx context.Context, id *int32, name *string) (*schemas.Board, error) {
	res, err := r.queries.UpdateBoard(ctx, sqlc.UpdateBoardParams{
		ID:   *id,
		Name: *name,
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

func (r *boardrepo) DeleteBoard(ctx context.Context, id *int32) error {
	return r.queries.DeleteBoard(ctx, *id)
}

func (r *boardrepo) CountBoardMembers(ctx context.Context, boardId *int32) (int64, error) {
	return r.queries.CountBoardMembers(ctx, pgtype.Int4{
		Int32: *boardId,
		Valid: true,
	})
}
func (r *boardrepo) GetBoardWithListsAndCards(ctx context.Context, boardId *int32) (*schemas.BoardWithListsAndCards, error) {
	boardRes, err := r.queries.GetBoardWithOwner(ctx, *boardId)
	if err != nil {
		return nil, errors.New("failed to fetch board: " + err.Error())
	}

	board := &schemas.BoardWithListsAndCards{
		ID:                boardRes.ID,
		Name:              boardRes.Name,
		OwnerID:           boardRes.OwnerID.Int32,
		CreatedAt:         boardRes.CreatedAt.Time,
		OwnerUsername:     boardRes.OwnerUsername,
		OwnerEmail:        boardRes.OwnerEmail,
		OwnerProfileImage: &boardRes.OwnerProfileImage,
		Lists:             []schemas.ListWithCards{},
		Members:           []schemas.User{},
	}

	members, err := r.queries.GetBoardMembers(ctx, pgtype.Int4{
		Int32: *boardId,
		Valid: true,
	})
	if err != nil {
		return nil, errors.New("failed to fetch board members: " + err.Error())
	}

	for _, m := range members {
		board.Members = append(board.Members, schemas.User{
			ID:           m.UserID.Int32,
			Username:     m.Username,
			Email:        m.Email,
			ProfileImage: &m.ProfileImage,
		})
	}

	lists, err := r.queries.GetListsByBoard(ctx, pgtype.Int4{
		Int32: *boardId,
		Valid: true,
	})
	if err != nil {
		return nil, errors.New("failed to fetch lists: " + err.Error())
	}

	for _, list := range lists {
		listWithCards := schemas.ListWithCards{
			ID:        list.ID,
			Name:      list.Name,
			Position:  list.Position,
			CreatedAt: list.CreatedAt.Time,
			Cards:     []schemas.CardWithDetails{},
		}

		cards, err := r.queries.GetCardsByList(ctx, pgtype.Int4{
			Int32: list.ID,
			Valid: true,
		})
		if err != nil {
			return nil, errors.New("failed to fetch cards: " + err.Error())
		}
		for _, card := range cards {
			cardWithLabels := schemas.CardWithDetails{
				ID:          card.ID,
				ListID:      card.ListID.Int32,
				Title:       card.Title,
				Description: nil,
				Position:    card.Position,
				Labels:      []schemas.Label{},
				Assignees:   []schemas.User{},
			}

			desc := card.Description
			cardWithLabels.Description = &desc

			labels, err := r.queries.GetCardLabels(ctx, card.ID)
			if err != nil {
				return nil, errors.New("failed to fetch card labels: " + err.Error())
			}

			for _, label := range labels {
				cardWithLabels.Labels = append(cardWithLabels.Labels, schemas.Label{
					ID:    label.ID,
					Name:  label.Name,
					Color: label.Color,
				})
			}

			assignees, err := r.queries.GetCardAssignees(ctx, card.ID)
			if err != nil {
				return nil, errors.New("failed to fetch card assignees: " + err.Error())
			}

			for _, assignee := range assignees {
				cardWithLabels.Assignees = append(cardWithLabels.Assignees, schemas.User{
					ID:           assignee.ID,
					Username:     assignee.Username,
					Email:        assignee.Email,
					ProfileImage: &assignee.ProfileImage,
				})
			}

			listWithCards.Cards = append(listWithCards.Cards, cardWithLabels)
		}

		board.Lists = append(board.Lists, listWithCards)
	}

	return board, nil
}

func (r *boardrepo) GetBoardMembers(ctx context.Context, boardId *int32) ([]schemas.User, error) {
	members, err := r.queries.GetBoardMembers(ctx, pgtype.Int4{
		Int32: *boardId,
		Valid: true,
	})
	if err != nil {
		return nil, err
	}

	var users []schemas.User
	for _, m := range members {
		users = append(users, schemas.User{
			ID:           m.UserID.Int32,
			Username:     m.Username,
			Email:        m.Email,
			ProfileImage: &m.ProfileImage,
		})
	}
	return users, nil
}

func (r *boardrepo) AddMember(ctx context.Context, boardId *int32, userId *int32) error {
	_, err := r.queries.CreateMembership(ctx, sqlc.CreateMembershipParams{
		BoardID: pgtype.Int4{
			Int32: *boardId,
			Valid: true,
		},
		UserID: pgtype.Int4{
			Int32: *userId,
			Valid: true,
		},
		Role: "member",
	})
	if err != nil {
		return err
	}
	return nil
}
