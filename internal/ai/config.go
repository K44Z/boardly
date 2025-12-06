package ai

import "github.com/gofiber/fiber/v2"

func NewAiRouter(app *fiber.App, service *AiService) {
	ai := app.Group("api/ai")
	handler := NewAiHandler(service)
	ai.Post("/prompt", handler.PromptHandler)
	ai.Post("/stt", handler.STTHandler)
}

type AiService struct{}
type AiHandler struct {
	service *AiService
}

func NewAiHandler(service *AiService) *AiHandler {
	return &AiHandler{
		service: service,
	}
}

func NewAIService() *AiService {
	return &AiService{}
}

type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type OllamaResponse struct {
	Response string `json:"response"`
}
