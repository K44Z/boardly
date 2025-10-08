package main

import (
	"log"
	"os"

	"github.com/K44Z/boardly/database"
	"github.com/K44Z/boardly/services/user/routes"
	"github.com/K44Z/boardly/services/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/joho/godotenv"
)

func main() {
	app := fiber.New()
	app.Use(logger.New())
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "8080"
	}
	DbUrl := os.Getenv("GOOSE_DBSTRING")
	db, err := database.ConnectDb(&schemas.Config{
		DbUrl: DbUrl,
		Port:  PORT,
	})
	if err != nil {
		log.Fatal(err)
	}
	UserService := services.NewUserService(db)
	routes.NewUserRouter(app, &UserService)
	SetupRoutes(app, db)
	err = app.Listen(PORT)
	if err != nil {
		log.Fatal(err)
	}
}
