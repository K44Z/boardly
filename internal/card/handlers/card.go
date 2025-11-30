package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/K44Z/boardly/internal/card/services"
	"github.com/K44Z/boardly/shared/utils"
	"github.com/davecgh/go-spew/spew"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgtype"
)

type CardHandler struct {
	service services.CardService
}

func NewCardHandler(s *services.CardService) *CardHandler {
	return &CardHandler{service: *s}
}

type CreateCardRequest struct {
	ListID      int32  `json:"list_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Position    int32  `json:"position"`
	DueDate     *int64 `json:"due_date"`
}

type UpdateCardRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	DueDate     *int64 `json:"due_date"`
}

type MoveCardRequest struct {
	ListID   int32 `json:"list_id"`
	Position int32 `json:"position"`
}
type AssignUserRequest struct {
	UserId int32 `json:"user_id"`
}

func (h *CardHandler) CreateCardHandler(c *fiber.Ctx) error {
	req := &CreateCardRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	var dueDate *pgtype.Timestamp
	if req.DueDate != nil {
		dueDate = &pgtype.Timestamp{
			Time:  time.Unix(*req.DueDate, 0),
			Valid: true,
		}
	}

	card, err := h.service.CreateCard(c.Context(), req.ListID, req.Title, req.Description, req.Position, dueDate)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error creating card", err)
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"card": card,
	})
}

func (h *CardHandler) GetCardByIDHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	card, err := h.service.GetCardByID(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting card", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"card": card,
	})
}

func (h *CardHandler) GetCardWithDetailsHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	card, err := h.service.GetCardWithDetails(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting card details", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"card": card,
	})
}

func (h *CardHandler) GetCardsByListHandler(c *fiber.Ctx) error {
	listIDStr := c.Params("listId")
	listID, err := strconv.ParseInt(listIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	cards, err := h.service.GetCardsByList(c.Context(), int32(listID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting cards", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"cards": cards,
	})
}

func (h *CardHandler) GetCardsByBoardHandler(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	cards, err := h.service.GetCardsByBoard(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting cards", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"cards": cards,
	})
}

func (h *CardHandler) UpdateCardHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	req := &UpdateCardRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	var dueDate *pgtype.Timestamp
	if req.DueDate != nil {
		dueDate = &pgtype.Timestamp{
			Time:  time.Unix(*req.DueDate, 0),
			Valid: true,
		}
	}

	card, err := h.service.UpdateCard(c.Context(), int32(id), req.Title, req.Description, dueDate)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error updating card", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"card": card,
	})
}

func (h *CardHandler) MoveCardHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	req := &MoveCardRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	err = h.service.MoveCard(c.Context(), int32(id), req.ListID, req.Position)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error moving card", err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{})
}

func (h *CardHandler) DeleteCardHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	err = h.service.DeleteCard(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error deleting card", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{})
}

func (h *CardHandler) GetOverdueCardsHandler(c *fiber.Ctx) error {
	cards, err := h.service.GetOverdueCards(c.Context())
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting overdue cards", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"cards": cards,
	})
}

func (h *CardHandler) GetCardsDueSoonHandler(c *fiber.Ctx) error {
	cards, err := h.service.GetCardsDueSoon(c.Context())
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting cards due soon", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"cards": cards,
	})
}

func (h *CardHandler) SearchCardsHandler(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return utils.SendError(c, http.StatusBadRequest, "query parameter 'q' is required", nil)
	}

	cards, err := h.service.SearchCards(c.Context(), query)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error searching cards", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"cards": cards,
	})
}

func (h *CardHandler) AssignUserToCardHandler(c *fiber.Ctx) error {
	CardIdStr := c.Params("id")
	if CardIdStr == "" {
		utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), errors.New("Card Id cannot be empty"))
	}
	cardId, err := strconv.Atoi(CardIdStr)
	if err != nil {
		utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrBadRequest.Error(), err)
	}
	req := &AssignUserRequest{}
	if err := c.BodyParser(req); err != nil {
		utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), err)
	}
	err = h.service.AssignUserToCard(c.Context(), req.UserId, int32(cardId))
	if err != nil {
		utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	assignees, err := h.service.GetAllCardAssignees(c.Context(), int32(cardId))
	if err != nil {
		utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}

	spew.Dump(assignees)
	return c.Status(200).JSON(fiber.Map{
		"assignee": assignees,
	})
}
