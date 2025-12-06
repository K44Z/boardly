package tests

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/K44Z/boardly/internal/user/handlers"
	"github.com/stretchr/testify/assert"
)

func TestAuthFlow(t *testing.T) {
	app, _ := SetupApp()

	registerPayload := handlers.RegisterRequest{
		Email:    "amine@gmail.com",
		Password: "sfkjsldkfjslkdfj",
		Username: "amine",
	}

	jsonRegister, _ := json.Marshal(registerPayload)

	req := httptest.NewRequest("POST", "/api/user/register", bytes.NewBuffer(jsonRegister))
	req.Header.Set("content-type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatal("register request failed:", err)
	}
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	body, _ := io.ReadAll(resp.Body)
	t.Log("Register response:", string(body))

	loginPayload := handlers.LoginRequest{
		Email:    "amine@gmail.com",
		Password: "sfkjsldkfjslkdfj",
	}
	jsonLogin, _ := json.Marshal(loginPayload)

	req = httptest.NewRequest("POST", "/api/user/login", bytes.NewBuffer(jsonLogin))
	req.Header.Set("content-type", "application/json")
	resp, err = app.Test(req, -1)
	if err != nil {
		t.Fatal("login request failed:", err)
	}
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	body, _ = io.ReadAll(resp.Body)
	t.Log("Login response:", string(body))
}
