package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/K44Z/boardly/shared/utils"
	"github.com/gofiber/fiber/v2"
)

type SttRequest struct {
	Audio *multipart.FileHeader `form:"audio"`
}

type SttResponse struct {
	Text string `json:"text"`
}

type WhisperResponse struct {
	Text string `json:"text"`
}

func (h *AiHandler) STTHandler(c *fiber.Ctx) error {
	file, err := c.FormFile("audio")
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), err)
	}

	src, err := file.Open()
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	defer src.Close()

	audioData, err := io.ReadAll(src)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}

	aiService := &AiService{}

	transcription, err := aiService.STT(audioData, file.Filename)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}

	var whisperResp WhisperResponse
	if err := json.Unmarshal(transcription, &whisperResp); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}

	return c.JSON(SttResponse{
		Text: whisperResp.Text,
	})
}

func (s *AiService) STT(audioData []byte, filename string) ([]byte, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("audio", filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := part.Write(audioData); err != nil {
		return nil, fmt.Errorf("failed to write audio data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close writer: %w", err)
	}

	req, err := http.NewRequest("POST", "http://localhost:8000/transcribe", body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("transcription service returned status %d: %s", res.StatusCode, string(bodyBytes))
	}

	response, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	return response, nil
}
