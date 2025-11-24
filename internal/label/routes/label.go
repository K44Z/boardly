package routes

import (
	"github.com/K44Z/boardly/internal/label/handlers"
	"github.com/K44Z/boardly/internal/label/services"
	"github.com/gofiber/fiber/v2"
)

func SetupLabelRoutes(app *fiber.App, s *services.LabelService) {
	// Label management routes
	labels := app.Group("/api/labels")
	labelHandler := handlers.NewLabelHandler(s)

	// Label CRUD operations
	labels.Post("/", labelHandler.CreateLabel)                        // POST /api/labels
	labels.Get("/:id", labelHandler.GetLabelByID)                     // GET /api/labels/:id
	labels.Get("/:id/with-count", labelHandler.GetLabelWithCardCount) // GET /api/labels/:id/with-count
	labels.Get("/:id/cards", labelHandler.GetLabelCards)              // GET /api/labels/:id/cards
	labels.Put("/:id", labelHandler.UpdateLabel)                      // PUT /api/labels/:id
	labels.Patch("/:id/name", labelHandler.UpdateLabelName)           // PATCH /api/labels/:id/name
	labels.Patch("/:id/color", labelHandler.UpdateLabelColor)         // PATCH /api/labels/:id/color
	labels.Delete("/:id", labelHandler.DeleteLabel)                   // DELETE /api/labels/:id

	// Board-specific label routes
	boards := app.Group("/api/boards")

	boards.Get("/:boardId/labels", labelHandler.GetLabelsByBoard)                  // GET /api/boards/:boardId/labels
	boards.Get("/:boardId/labels/with-count", labelHandler.GetLabelsWithCardCount) // GET /api/boards/:boardId/labels/with-count
	boards.Post("/:boardId/labels/search", labelHandler.SearchLabels)              // POST /api/boards/:boardId/labels/search
	boards.Get("/:boardId/labels/by-color", labelHandler.GetLabelsByColor)         // GET /api/boards/:boardId/labels/by-color?color=value
	boards.Get("/:boardId/labels/count", labelHandler.CountLabelsByBoard)          // GET /api/boards/:boardId/labels/count
	boards.Get("/:boardId/labels/most-used", labelHandler.GetMostUsedLabels)       // GET /api/boards/:boardId/labels/most-used?limit=10

	// Card-label association routes
	cards := app.Group("/api/cards")

	cards.Get("/:cardId/labels", labelHandler.GetCardLabels)                    // GET /api/cards/:cardId/labels
	cards.Post("/:cardId/labels", labelHandler.AddLabelToCard)                  // POST /api/cards/:cardId/labels
	cards.Delete("/:cardId/labels/:labelId", labelHandler.RemoveLabelFromCard)  // DELETE /api/cards/:cardId/labels/:labelId
	cards.Delete("/:cardId/labels", labelHandler.RemoveAllLabelsFromCard)       // DELETE /api/cards/:cardId/labels
	cards.Get("/:cardId/labels/:labelId/check", labelHandler.CheckCardHasLabel) // GET /api/cards/:cardId/labels/:labelId/check
}
