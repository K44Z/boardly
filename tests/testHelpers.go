package tests

import (
	"context"
	"database/sql"
	"log"

	_ "github.com/lib/pq"

	"os"

	"github.com/K44Z/boardly/internal/ai"
	br "github.com/K44Z/boardly/internal/board/routes"
	bs "github.com/K44Z/boardly/internal/board/services"
	cr "github.com/K44Z/boardly/internal/card/routes"
	cs "github.com/K44Z/boardly/internal/card/services"
	lar "github.com/K44Z/boardly/internal/label/routes"
	las "github.com/K44Z/boardly/internal/label/services"
	lr "github.com/K44Z/boardly/internal/list/routes"
	ls "github.com/K44Z/boardly/internal/list/services"
	ur "github.com/K44Z/boardly/internal/user/routes"
	us "github.com/K44Z/boardly/internal/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pressly/goose/v3"
)

func SetupApp() (*fiber.App, *schemas.DB) {
	dbUrl := os.Getenv("TEST_DB_URL")
	if dbUrl == "" {
		dbUrl = "postgres://test:test@localhost:5432/test?sslmode=disable"
	}
	config := &schemas.Config{
		DbUrl: dbUrl,
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

	// Initialize Services
	userService := us.NewUserService(db)
	boardService := bs.NewBoardService(db)
	listService := ls.NewListService(db)
	cardService := cs.NewCardService(db)
	labelService := las.NewLabelService(db)
	aiService := ai.NewAIService()

	// Setup Routes
	ur.NewUserRouter(app, &userService)
	br.NewBoardRouter(app, &boardService)
	lr.NewListRouter(app, &listService)
	cr.NewCardRouter(app, &cardService)
	lar.SetupLabelRoutes(app, labelService)
	ai.NewAiRouter(app, aiService)

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
