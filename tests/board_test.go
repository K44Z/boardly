package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/K44Z/boardly/services/board/handlers"
	"github.com/K44Z/boardly/services/board/services"
	"github.com/stretchr/testify/assert"
)

func TestCreateBoardHandler(t *testing.T) {
	app, db := SetupApp()
	s := services.NewBoardService(db)
	h := handlers.NewBoardHandler(&s)
	app.Post("/create", h.CreateBoardHandler)
	payload := &handlers.CreateBoardRequest{
		Name:    "gocampus",
		OwnerId: "1",
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		t.Fatal("error marshaling payload ", err)
	}
	req := httptest.NewRequest("POST", "/create", bytes.NewBuffer(jsonBody))
	req.Header.Set("content-type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatal("error sending request", err)
	}
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	response, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal("error reading response :", err)
	}
	fmt.Println(string(response))
}
