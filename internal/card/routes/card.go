package routes

import (
	"github.com/K44Z/boardly/internal/card/handlers"
	"github.com/K44Z/boardly/internal/card/services"
	"github.com/gofiber/fiber/v2"
)

func NewCardRouter(app *fiber.App, s *services.CardService) {
	handler := handlers.NewCardHandler(s)
	cards := app.Group("/api/cards")

	// CRUD operations
	cards.Post("/", handler.CreateCardHandler)
	cards.Get("/:id", handler.GetCardByIDHandler)
	cards.Get("/:id/details", handler.GetCardWithDetailsHandler)
	cards.Put("/:id", handler.UpdateCardHandler)
	cards.Patch("/:id/move", handler.MoveCardHandler)
	cards.Delete("/:id", handler.DeleteCardHandler)

	// List/Board operations
	cards.Get("/list/:listId", handler.GetCardsByListHandler)
	cards.Get("/board/:boardId", handler.GetCardsByBoardHandler)

	// Special queries
	cards.Get("/overdue", handler.GetOverdueCardsHandler)
	cards.Get("/due-soon", handler.GetCardsDueSoonHandler)
	cards.Get("/search", handler.SearchCardsHandler)

	//assignments
	cards.Post("/:id/assign", handler.AssignUserToCardHandler)
}
