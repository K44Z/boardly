package ai

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type AiService struct{}

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
	req, err := http.NewRequest("POST", "http://localhost:11434/api/generate", bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}
	client := http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
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
