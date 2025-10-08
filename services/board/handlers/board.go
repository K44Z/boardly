package handlers

import (
	"net/http"
	"strconv"

	"github.com/K44Z/boardly/services/board/services"
	"github.com/gofiber/fiber/v2"
)

type BoardHandler struct {
	service services.BoardService
}

func NewBoardHandler(s *services.BoardService) *BoardHandler {
	return &BoardHandler{
		service: *s,
	}
}

type CreateBoardRequest struct {
	Name    string `json:"name"`
	OwnerId string `json:"ownerId"`
}

type GetBoradByIdRequest struct {
	OwnerId string `json:"ownerId"`
}

func (h *BoardHandler) CreateBoardHandler(c *fiber.Ctx) error {
	req := &CreateBoardRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "error parsing request: " + err.Error(),
		})
	}
	id, err := strconv.Atoi(req.OwnerId)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "error parsing id: " + err.Error(),
		})
	}

	_, err = h.service.CreateBoard(c.Context(), req.Name, int32(id))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "error creating board: " + err.Error(),
		})
	}
	return c.SendStatus(http.StatusCreated)
}

func (h *BoardHandler) GetBoardByIdHandler(c *fiber.Ctx) error {
	req := &GetBoradByIdRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "error parsing request :" + err.Error(),
		})
	}
	id, err := strconv.Atoi(req.OwnerId)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "error parsing id" + err.Error(),
		})
	}

	res, err := h.service.GetBoardByID(c.Context(), int32(id))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "error getting board: " + err.Error(),
		})
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"board": *res,
	})
}
