package routes

import (
	"github.com/K44Z/boardly/internal/board/handlers"
	"github.com/K44Z/boardly/internal/board/services"
	middleware "github.com/K44Z/boardly/internal/user/middleware"
	"github.com/gofiber/fiber/v2"
)

func NewBoardRouter(app *fiber.App, s *services.BoardService) {
	h := handlers.NewBoardHandler(s)
	board := app.Group("api/board", middleware.Jwt)

	board.Get("/", h.ListUserBoardsHandler)
	board.Post("/", h.CreateBoardHandler)
	board.Get("/:id", h.GetBoardByIdHandler)
	board.Put("/:id", h.UpdateBoardHandler)
	board.Delete("/:id", h.DeleteBoardHandler)
}
