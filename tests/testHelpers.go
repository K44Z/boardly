package tests

import (
	"context"
	"database/sql"
	"log"

	_ "github.com/lib/pq"

	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pressly/goose/v3"
)

func SetupApp() (*fiber.App, *schemas.DB) {
	config := &schemas.Config{
		DbUrl: "postgres://test:test@localhost:5432/test?sslmode=disable",
	}
	app := fiber.New()

	db, err := ConnectDb(config)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	err = CleanTables(db.Pool)
	if err != nil {
		log.Fatal("error cleaning tables ")
	}
	return app, db
}

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

	if err := goose.Up(sqlDB, "../database/migrations"); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	log.Println("Migrations applied successfully")
}

var tablesToClean = []string{
	"card_labels",
	"assignments",
	"comment_suggestions",
	"card_summaries",
	"comments",
	"cards",
	"lists",
	"labels",
	"memberships",
	"boards",
	"sessions",
	"users",
}

func CleanTables(pool *pgxpool.Pool) error {
	ctx := context.Background()
	for _, table := range tablesToClean {
		_, err := pool.Exec(ctx, "TRUNCATE TABLE "+table+" RESTART IDENTITY CASCADE")
		if err != nil {
			return err
		}
	}
	return nil
}
