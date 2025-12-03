package dto

import (
	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/K44Z/boardly/shared/schemas"
)

func NewUser(u *sqlc.User, b []schemas.Board) *schemas.User {
	return &schemas.User{
		ID:           u.ID,
		Email:        u.Email,
		Username:     u.Username,
		ProfileImage: u.ProfileImage,
		Boards:       b,
	}
}
func NewUsers(u []sqlc.User) []schemas.User {
	var users []schemas.User
	for _, v := range u {
		users = append(users, schemas.User{
			ID:           v.ID,
			Username:     v.Username,
			Email:        v.Email,
			ProfileImage: v.ProfileImage,
		})
	}
	return users
}

func NewBoard(data *sqlc.GetBoardWithOwnerRow) *schemas.Board {
	return &schemas.Board{
		ID:      data.ID,
		Name:    data.Name,
		OwnerID: data.OwnerID,
	}
}
