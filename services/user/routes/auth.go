package routes

import (
	"github.com/K44Z/boardly/services/user/handlers"
	"github.com/K44Z/boardly/services/user/services"
	"github.com/gofiber/fiber/v2"
)

func NewUserRouter(app *fiber.App, s *services.UserService) {
	app.Group("/api/user")

	handler := handlers.NewUserHandler(s)
	app.Post("/login", handler.Login)
	app.Post("/register", handler.Register)
}
