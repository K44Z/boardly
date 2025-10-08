package routes

import (
	"github.com/K44Z/boardly/services/user/handlers"
	"github.com/K44Z/boardly/services/user/services"
	"github.com/gofiber/fiber/v2"
)

func NewUserRouter(app *fiber.App, s *services.UserService) {
	handler := handlers.NewUserHandler(s)
	user := app.Group("/api/user")
	user.Post("/login", handler.Login)
	user.Post("/register", handler.Register)
}
