package handlers

import (
	"net/http"
	"strconv"

	"github.com/K44Z/boardly/internal/label/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/K44Z/boardly/shared/utils"
	"github.com/gofiber/fiber/v2"
)

type LabelHandler struct {
	service *services.LabelService
}

func NewLabelHandler(service *services.LabelService) *LabelHandler {
	return &LabelHandler{service: service}
}

type CreateLabelRequest struct {
	BoardID int32  `json:"board_id" validate:"required,min=1"`
	Name    string `json:"name" validate:"required,min=1,max=50"`
	Color   string `json:"color" validate:"required,hexcolor|rgb|rgba|hsl"`
}

type UpdateLabelRequest struct {
	Name  string `json:"name" validate:"required,min=1,max=50"`
	Color string `json:"color" validate:"required,hexcolor|rgb|rgba|hsl"`
}

type UpdateLabelNameRequest struct {
	Name string `json:"name" validate:"required,min=1,max=50"`
}

type UpdateLabelColorRequest struct {
	Color string `json:"color" validate:"required,hexcolor|rgb|rgba|hsl"`
}

type SearchLabelsRequest struct {
	Query string `json:"query" validate:"required,min=1,max=100"`
}

type AddLabelToCardRequest struct {
	LabelID int32 `json:"label_id" validate:"required,min=1"`
}

func (h *LabelHandler) CreateLabel(c *fiber.Ctx) error {
	req := &CreateLabelRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request body", err)
	}

	label := &schemas.Label{
		BoardID: req.BoardID,
		Name:    req.Name,
		Color:   req.Color,
	}

	createdLabel, err := h.service.CreateLabel(c.Context(), label)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create label", err)
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"label": createdLabel,
	})
}

func (h *LabelHandler) GetLabelByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	label, err := h.service.GetLabelByID(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusNotFound, "Label not found", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"label": label,
	})
}

func (h *LabelHandler) GetLabelsByBoard(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid board ID", err)
	}

	labels, err := h.service.GetLabelsByBoard(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to get labels", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})
}

func (h *LabelHandler) GetLabelWithCardCount(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	label, err := h.service.GetLabelWithCardCount(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusNotFound, "Label not found", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"label": label,
	})
}

func (h *LabelHandler) GetLabelsWithCardCount(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid board ID", err)
	}

	labels, err := h.service.GetLabelsWithCardCount(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to get labels with count", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})
}

func (h *LabelHandler) UpdateLabel(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	req := &UpdateLabelRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request body", err)
	}

	label, err := h.service.UpdateLabel(c.Context(), int32(id), req.Name, req.Color)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update label", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"label": label,
	})
}

func (h *LabelHandler) UpdateLabelName(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	req := &UpdateLabelNameRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request body", err)
	}

	label, err := h.service.UpdateLabelName(c.Context(), int32(id), req.Name)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update label name", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"label": label,
	})
}

func (h *LabelHandler) UpdateLabelColor(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	req := &UpdateLabelColorRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request body", err)
	}

	label, err := h.service.UpdateLabelColor(c.Context(), int32(id), req.Color)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update label color", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"label": label,
	})
}

func (h *LabelHandler) DeleteLabel(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	err = h.service.DeleteLabel(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete label", err)
	}

	return c.SendStatus(http.StatusNoContent)
}

func (h *LabelHandler) SearchLabels(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid board ID", err)
	}

	req := &SearchLabelsRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request body", err)
	}

	labels, err := h.service.SearchLabels(c.Context(), int32(boardID), req.Query)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to search labels", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})
}

func (h *LabelHandler) GetLabelsByColor(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid board ID", err)
	}

	color := c.Query("color")
	if color == "" {
		return utils.SendError(c, http.StatusBadRequest, "Color parameter is required", nil)
	}

	labels, err := h.service.GetLabelsByColor(c.Context(), int32(boardID), color)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to get labels by color", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})
}

func (h *LabelHandler) CountLabelsByBoard(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid board ID", err)
	}

	count, err := h.service.CountLabelsByBoard(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to count labels", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"count": count,
	})
}

func (h *LabelHandler) GetMostUsedLabels(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid board ID", err)
	}

	limitStr := c.Query("limit", "10")
	limit, err := strconv.ParseInt(limitStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid limit parameter", err)
	}

	labels, err := h.service.GetMostUsedLabels(c.Context(), int32(boardID), int32(limit))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to get most used labels", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})
}

// Card Label operations
func (h *LabelHandler) AddLabelToCard(c *fiber.Ctx) error {
	cardIDStr := c.Params("cardId")
	cardID, err := strconv.ParseInt(cardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid card ID", err)
	}

	req := &AddLabelToCardRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request body", err)
	}

	err = h.service.AddLabelToCard(c.Context(), int32(cardID), req.LabelID)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to add label to card", err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{})

}

func (h *LabelHandler) RemoveLabelFromCard(c *fiber.Ctx) error {
	cardIDStr := c.Params("cardId")
	cardID, err := strconv.ParseInt(cardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid card ID", err)
	}

	labelIDStr := c.Params("labelId")
	labelID, err := strconv.ParseInt(labelIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	err = h.service.RemoveLabelFromCard(c.Context(), int32(cardID), int32(labelID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to remove label from card", err)
	}

	return c.SendStatus(http.StatusNoContent)
}

func (h *LabelHandler) GetCardLabels(c *fiber.Ctx) error {
	cardIDStr := c.Params("cardId")
	cardID, err := strconv.ParseInt(cardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid card ID", err)
	}

	labels, err := h.service.GetCardLabels(c.Context(), int32(cardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to get card labels", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})
}

func (h *LabelHandler) GetLabelCards(c *fiber.Ctx) error {
	labelIDStr := c.Params("id")
	labelID, err := strconv.ParseInt(labelIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	cards, err := h.service.GetLabelCards(c.Context(), int32(labelID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to get label cards", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"cards": cards,
	})
}

func (h *LabelHandler) RemoveAllLabelsFromCard(c *fiber.Ctx) error {
	cardIDStr := c.Params("cardId")
	cardID, err := strconv.ParseInt(cardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid card ID", err)
	}

	err = h.service.RemoveAllLabelsFromCard(c.Context(), int32(cardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to remove all labels from card", err)
	}

	return c.SendStatus(http.StatusNoContent)
}

func (h *LabelHandler) CheckCardHasLabel(c *fiber.Ctx) error {
	cardIDStr := c.Params("cardId")
	cardID, err := strconv.ParseInt(cardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid card ID", err)
	}

	labelIDStr := c.Params("labelId")
	labelID, err := strconv.ParseInt(labelIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid label ID", err)
	}

	hasLabel, err := h.service.CheckCardHasLabel(c.Context(), int32(cardID), int32(labelID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to check card label", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"has_label": hasLabel,
	})
}

func (h *LabelHandler) GetALLLabelsHandler(c *fiber.Ctx) error {
	labels, err := h.service.GetAllLabels(c.Context())
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"labels": labels,
	})

}
