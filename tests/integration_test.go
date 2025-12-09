package tests

import (
	"log"
	"testing"

	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"

	"github.com/K44Z/boardly/internal/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/stretchr/testify/assert"

	bh "github.com/K44Z/boardly/internal/board/handlers"

	ch "github.com/K44Z/boardly/internal/card/handlers"

	lh "github.com/K44Z/boardly/internal/list/handlers"

	uh "github.com/K44Z/boardly/internal/user/handlers"
)

func TestFullUserJourney(t *testing.T) {
	app, _ := SetupApp()
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

	var loginResp map[string]any
	json.NewDecoder(resp.Body).Decode(&loginResp)
	token := loginResp["token"].(string)
	assert.NotEmpty(t, token)

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
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	var listResp schemas.List
	json.NewDecoder(resp.Body).Decode(&listResp)
	assert.Equal(t, listName, listResp.Name)
	listID := listResp.ID
	fmt.Println("List id ", listID)
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

	req = httptest.NewRequest("GET", fmt.Sprintf("/api/board/%d/full", boardID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	req = httptest.NewRequest("DELETE", fmt.Sprintf("/api/board/%d", boardID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err = app.Test(req, -1)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestRepo(t *testing.T) {
	db, err := ConnectDb(&schemas.Config{
		DbUrl: "postgres://boardly:boardly@localhost:5432/boardly?sslmode=disable",
		Port:  "8080",
	})
	if err != nil {
		log.Fatal(err)
	}
	userService := services.NewUserService(db)
	str := "amine@gmail.com"
	_, err = userService.CheckUser(t.Context(), &str)
	if err != nil {
		log.Fatal(err)
	}
	assert.NoError(t, err)
}
