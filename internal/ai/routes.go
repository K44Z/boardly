package ai

import "github.com/gofiber/fiber/v2"

func NewAiRouter(app *fiber.App, service *AiService) {
	ai := app.Group("api/ai")
	handler := NewAiHandler(service)
	ai.Post("/prompt", handler.PromptHandler)
}
