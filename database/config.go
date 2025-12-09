package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"github.com/K44Z/boardly/shared/schemas"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pressly/goose/v3"
)

func ConnectDb(c *schemas.Config) (*schemas.DB, error) {
	RunMigrations(c.DbUrl)
	conn, err := pgxpool.New(context.Background(), c.DbUrl)
	if err != nil {
		return nil, err
	}
	err = conn.Ping(context.Background())
	if err != nil {
		return nil, err
	}
	return &schemas.DB{
		DBTX: conn,
		Pool: conn,
	}, nil
}

func RunMigrations(connStr string) {
	sqlDB, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("failed to open sql.DB: %v", err)
	}
	defer sqlDB.Close()

	if err := goose.Up(sqlDB, "./database/migrations"); err != nil {
		fmt.Println("No New migrations Found skipping ...:", err)
	}

	log.Println("Migrations applied")
}
