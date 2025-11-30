package schemas

import (
	"time"

	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID       int32   `json:"id"`
	Email    string  `json:"email"`
	Password string  `json:"-"`
	Username string  `json:"username"`
	Boards   []Board `json:"boards"`
}
type Board struct {
	ID        int32
	Name      string
	OwnerID   pgtype.Int4
	CreatedAt pgtype.Timestamp
}

type BoardWithOwner struct {
	ID            int32     `json:"id"`
	Name          string    `json:"name"`
	OwnerID       int32     `json:"owner_id"`
	CreatedAt     time.Time `json:"created_at"`
	OwnerUsername string    `json:"owner_username"`
	MemberCount   int64     `json:"member_count,omitempty"`
}

type List struct {
	ID       int32  `json:"id"`
	BoardID  int32  `json:"board_id"`
	Name     string `json:"name"`
	Position int32  `json:"position"`
}

type ListWithCardCount struct {
	ID        int32  `json:"id"`
	BoardID   int32  `json:"board_id"`
	Name      string `json:"name"`
	Position  int32  `json:"position"`
	CardCount int    `json:"card_count"`
}

type Card struct {
	ID          int32             `json:"id"`
	ListID      int32             `json:"list_id"`
	Title       string            `json:"title"`
	Description *string           `json:"description"`
	Position    int32             `json:"position"`
	DueDate     *pgtype.Timestamp `json:"due_date"`
}

type CardWithDetails struct {
	ID          int32             `json:"id"`
	ListID      int32             `json:"list_id"`
	Title       string            `json:"title"`
	Description *string           `json:"description"`
	Position    int32             `json:"position"`
	DueDate     *pgtype.Timestamp `json:"due_date"`
	ListName    string            `json:"list_name"`
	BoardID     int32             `json:"board_id"`
	Labels      []Label           `json:"labels"`
	Assignees   []User            `json:"assignees"`
}

type Label struct {
	ID      int32  `json:"id"`
	BoardID int32  `json:"board_id"`
	Name    string `json:"name"`
	Color   string `json:"color"`
}

type LabelWithCount struct {
	ID        int32  `json:"id"`
	BoardID   int32  `json:"board_id"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	CardCount int    `json:"card_count"`
}

type CardWithList struct {
	ID          int32   `json:"id"`
	ListID      int32   `json:"list_id"`
	Title       string  `json:"title"`
	Description *string `json:"description"`
	Position    int32   `json:"position"`
	DueDate     *string `json:"due_date"`
	ListName    string  `json:"list_name"`
	BoardID     int32   `json:"board_id"`
}

type Comment struct {
	ID       int32  `json:"id"`
	CardID   int32  `json:"card_id"`
	UserID   int32  `json:"user_id"`
	Text     string `json:"text"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type Assignment struct {
	CardID   int32  `json:"card_id"`
	UserID   int32  `json:"user_id"`
	Username string `json:"username"`
}

type Membership struct {
	ID      int32  `json:"id"`
	BoardID int32  `json:"board_id"`
	UserID  int32  `json:"user_id"`
	Role    string `json:"role"`
}

type DB struct {
	DBTX sqlc.DBTX
	Pool *pgxpool.Pool
}

type Config struct {
	DbUrl string
	Port  string
}

type BoardWithListsAndCards struct {
	ID            int32           `json:"id"`
	Name          string          `json:"name"`
	OwnerID       int32           `json:"owner_id"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	OwnerUsername string          `json:"owner_username"`
	OwnerEmail    string          `json:"owner_email"`
	Lists         []ListWithCards `json:"lists"`
}

type ListWithCards struct {
	ID        int32             `json:"id"`
	Name      string            `json:"name"`
	Position  int32             `json:"position"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
	Cards     []CardWithDetails `json:"cards"`
}
