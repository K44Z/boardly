package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"os"

	"github.com/K44Z/boardly/database"
	"github.com/K44Z/boardly/database/seeders"
	"github.com/K44Z/boardly/internal/ai"
	an "github.com/K44Z/boardly/internal/analytics/services"
	b "github.com/K44Z/boardly/internal/board/services"
	c "github.com/K44Z/boardly/internal/card/services"
	la "github.com/K44Z/boardly/internal/label/services"
	l "github.com/K44Z/boardly/internal/list/services"
	"github.com/K44Z/boardly/internal/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type Services struct {
	UserService      services.UserService
	BoardService     b.BoardService
	ListService      l.ListService
	CardService      c.CardService
	LabelService     la.LabelService
	AIService        ai.AiService
	AnalyticsService an.AnalyticsService
}

func loadConfig() (string, string) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "8080"
	}

	DbUrl := os.Getenv("GOOSE_DBSTRING")
	if DbUrl == "" {
		log.Fatal("GOOSE_DBSTRING environment variable is required")
	}

	return PORT, DbUrl
}

func setupDatabase(dbUrl, port string) (*schemas.DB, error) {
	config := &schemas.Config{
		DbUrl: dbUrl,
		Port:  port,
	}
	return database.ConnectDb(config)
}

func initializeServices(db *schemas.DB) (*Services, error) {
	return &Services{
		UserService:      services.NewUserService(db),
		BoardService:     b.NewBoardService(db),
		ListService:      l.NewListService(db),
		CardService:      c.NewCardService(db),
		LabelService:     *la.NewLabelService(db),
		AIService:        *ai.NewAIService(),
		AnalyticsService: an.NewAnalyticsService(db),
	}, nil
}

func setupMiddleware(app *fiber.App) {
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "*",
	}))

	app.Use(logger.New())
}

func setupRoutes(app *fiber.App, services *Services, db *schemas.DB) {
	SetupRoutes(app, services, db)
}

func SeedDatabase() error {
	clear := flag.Bool("clear", false, "Clear database before seeding")
	flag.Parse()

	dbUrl := os.Getenv("GOOSE_DBSTRING")
	if dbUrl == "" {
		return errors.New("GOOSE_DBSTRING environment variable is required")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbUrl)
	if err != nil {
		return err
	}
	defer pool.Close()

	seeder := seeders.NewSeeder(pool)

	if *clear {
		if err := seeder.Clear(ctx); err != nil {
			return err
		}
	} else {
		hasData, err := seeder.HasData(ctx)
		if err != nil {
			return err
		}
		if hasData {
			log.Println("Database already seeded, skipping...")
			return nil
		}
	}

	if err := seeder.Seed(ctx); err != nil {
		return err
	}

	log.Println("Seeding completed successfully!")
	return nil
}

func main() {
	app := fiber.New()
	app.Static("/static", "./static")

	setupMiddleware(app)

	PORT, DbUrl := loadConfig()
	err := SeedDatabase()
	if err != nil {
		log.Fatal(err)
	}
	db, err := setupDatabase(DbUrl, PORT)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	services, err := initializeServices(db)
	if err != nil {
		log.Fatal("Failed to initialize services:", err)
	}

	setupRoutes(app, services, db)

	log.Printf("Server starting on port %s", PORT)
	err = app.Listen(":" + PORT)
	if err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
