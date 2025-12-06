package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	bh "github.com/K44Z/boardly/internal/board/handlers"
	ch "github.com/K44Z/boardly/internal/card/handlers"
	lh "github.com/K44Z/boardly/internal/list/handlers"
	uh "github.com/K44Z/boardly/internal/user/handlers"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/stretchr/testify/assert"
)

func TestFullUserJourney(t *testing.T) {
	app, _ := SetupApp()

	// 1. Register
	email := "integration@example.com"
	password := "securepassword"
	username := "integrationuser"

	registerPayload := uh.RegisterRequest{
		Email:    email,
		Password: password,
		Username: username,
	}
	body, _ := json.Marshal(registerPayload)
	req := httptest.NewRequest("POST", "/api/user/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 2. Login
	loginPayload := uh.LoginRequest{
		Email:    email,
		Password: password,
	}
	body, _ = json.Marshal(loginPayload)
	req = httptest.NewRequest("POST", "/api/user/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var loginResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&loginResp)
	token := loginResp["token"].(string)
	assert.NotEmpty(t, token)

	// 3. Create Board
	boardName := "Integration Board"
	createBoardPayload := bh.CreateBoardRequest{
		Name: boardName,
	}
	body, _ = json.Marshal(createBoardPayload)
	req = httptest.NewRequest("POST", "/api/board", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var boardResp map[string]schemas.Board
	json.NewDecoder(resp.Body).Decode(&boardResp)
	board := boardResp["board"]
	assert.Equal(t, boardName, board.Name)
	boardID := board.ID

	// 4. Create List
	listName := "To Do"
	createListPayload := lh.CreateListRequest{
		Name:     listName,
		BoardID:  boardID,
		Position: 0,
	}
	body, _ = json.Marshal(createListPayload)
	req = httptest.NewRequest("POST", "/api/lists/create", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var listResp schemas.List
	json.NewDecoder(resp.Body).Decode(&listResp)
	assert.Equal(t, listName, listResp.Name)
	listID := listResp.ID

	// 5. Create Card
	cardTitle := "Integration Card"
	createCardPayload := ch.CreateCardRequest{
		ListID:      listID,
		Title:       cardTitle,
		Description: "Test Description",
		Position:    0,
	}
	body, _ = json.Marshal(createCardPayload)
	req = httptest.NewRequest("POST", "/api/cards", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var cardResp schemas.Card
	json.NewDecoder(resp.Body).Decode(&cardResp)
	assert.Equal(t, cardTitle, cardResp.Title)
	_ = cardResp.ID

	// 6. Verify Card Exists via Get Board
	req = httptest.NewRequest("GET", fmt.Sprintf("/api/board/%d/full", boardID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 7. Delete Board
	req = httptest.NewRequest("DELETE", fmt.Sprintf("/api/board/%d", boardID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
