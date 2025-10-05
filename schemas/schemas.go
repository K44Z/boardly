package schemas

import (
	sqlc "github.com/K44Z/boardly/database/generated"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID       int32  `json:"id"`
	Email    string `json:"email"`
	Password string `json:"-"`
	Username string `json:"username"`
}

type DB struct {
	DBTX sqlc.DBTX
	Pool *pgxpool.Pool
}

type Config struct {
	DbUrl string
	Port  string
}
