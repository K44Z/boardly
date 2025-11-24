package routes

import (
	"github.com/K44Z/boardly/internal/list/handlers"
	"github.com/K44Z/boardly/internal/list/services"
	"github.com/gofiber/fiber/v2"
)

func NewListRouter(app *fiber.App, s *services.ListService) {
	handler := handlers.NewListHandler(*s)
	lists := app.Group("/api/lists")

	// CRUD operations
	lists.Post("/create", handler.CreateListHandler)
	lists.Get("/:id", handler.GetListByIDHandler)
	lists.Put("/:id/title", handler.UpdateListTitleHandler)
	lists.Put("/:id/position", handler.UpdateListPositionHandler)
	lists.Delete("/:id", handler.DeleteListHandler)

	// Board-specific operations
	lists.Get("/board/:boardId", handler.GetListsByBoardHandler)
	lists.Get("/board/:boardId/with-count", handler.GetListsWithCardCountHandler)
	lists.Get("/board/:boardId/max-position", handler.GetMaxListPositionHandler)
	lists.Get("/board/:boardId/count", handler.CountListsByBoardHandler)

	// Batch operations
	lists.Put("/positions", handler.UpdateListPositionsHandler)
}
