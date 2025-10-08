package routes

import (
	"github.com/K44Z/boardly/services/board/handlers"
	"github.com/K44Z/boardly/services/board/services"
	"github.com/gofiber/fiber/v2"
)

func NewBoardRouter(app *fiber.App, s *services.BoardService) {
	h := handlers.NewBoardHandler(s)
	board := app.Group("api/board")
	board.Get("/", h.GetBoardByIdHandler)
	board.Post("/create", h.CreateBoardHandler)
}
