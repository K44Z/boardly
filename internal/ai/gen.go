package ai

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/K44Z/boardly/shared/utils"
	"github.com/gofiber/fiber/v2"
)

func ollamaURL() string {
	if u := os.Getenv("OLLAMA_URL"); u != "" {
		return u
	}
	return "http://localhost:11434"
}

func (a *AiService) PromptOllama(model, prompt string) (*OllamaResponse, error) {
	if model == "" {
		model = "qwen2.5:0.5b"
	}
	obj := &OllamaRequest{
		Model:  model,
		Prompt: prompt,
		Stream: false,
	}
	payload, err := json.Marshal(obj)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", ollamaURL()+"/api/generate", bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}
	client := http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	resBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	var jsonReponse OllamaResponse
	err = json.Unmarshal(resBytes, &jsonReponse)
	if err != nil {
		return nil, err
	}
	return &jsonReponse, nil
}

func (h *AiHandler) PromptHandler(c *fiber.Ctx) error {
	req := &OllamaRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), err)
	}
	res, err := h.service.PromptOllama(req.Model, req.Prompt)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"response": res,
	})

}
