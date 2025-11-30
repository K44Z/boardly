package routes

import (
	"github.com/K44Z/boardly/internal/user/handlers"
	"github.com/K44Z/boardly/internal/user/services"
	"github.com/gofiber/fiber/v2"
)

func NewUserRouter(app *fiber.App, s *services.UserService) {
	handler := handlers.NewUserHandler(s)
	user := app.Group("/api/user")
	user.Post("/login", handler.Login)
	user.Post("/register", handler.Register)
	user.Get("/userId/:id", handler.GetUserByIdHandler)
	user.Post("/search", handler.SearchUsersHandler)
	user.Post("/all", handler.GetAllUsersHandler)
}
