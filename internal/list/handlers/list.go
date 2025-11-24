package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/K44Z/boardly/internal/list/services"
	"github.com/K44Z/boardly/shared/utils"
	"github.com/gofiber/fiber/v2"
)

type ListHandler struct {
	service services.ListService
}

func NewListHandler(s services.ListService) *ListHandler {
	return &ListHandler{service: s}
}

type CreateListRequest struct {
	BoardID  int32  `json:"board_id"`
	Name     string `json:"name"`
	Position int32  `json:"position"`
}

type UpdateListTitleRequest struct {
	Name string `json:"name"`
}

type UpdateListPositionRequest struct {
	Position int32 `json:"position"`
}

type UpdateListPositionsRequest struct {
	IDs     []int32 `json:"ids"`
	BoardID int32   `json:"board_id"`
}

func (h *ListHandler) CreateListHandler(c *fiber.Ctx) error {
	req := &CreateListRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}
	fmt.Println(req)
	list, err := h.service.CreateList(c.Context(), req.BoardID, req.Name, req.Position)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error creating list", err)
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"list": list,
	})
}

func (h *ListHandler) GetListByIDHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	list, err := h.service.GetListByID(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting list", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"list": list,
	})
}

func (h *ListHandler) GetListsByBoardHandler(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	lists, err := h.service.GetListsByBoard(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting lists", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"lists": lists,
	})
}

func (h *ListHandler) GetListsWithCardCountHandler(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	lists, err := h.service.GetListsWithCardCount(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting lists with card count", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"lists": lists,
	})
}

func (h *ListHandler) UpdateListTitleHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	req := &UpdateListTitleRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	list, err := h.service.UpdateListTitle(c.Context(), int32(id), req.Name)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error updating list title", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"list": list,
	})
}

func (h *ListHandler) UpdateListPositionHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	req := &UpdateListPositionRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	err = h.service.UpdateListPosition(c.Context(), int32(id), req.Position)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error updating list position", err)
	}

	return c.SendStatus(http.StatusOK)
}

func (h *ListHandler) UpdateListPositionsHandler(c *fiber.Ctx) error {
	req := &UpdateListPositionsRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	err := h.service.UpdateListPositions(c.Context(), req.IDs, req.BoardID)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error updating list positions", err)
	}

	return c.SendStatus(http.StatusOK)
}

func (h *ListHandler) DeleteListHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	err = h.service.DeleteList(c.Context(), int32(id))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error deleting list", err)
	}

	return c.SendStatus(http.StatusOK)
}

func (h *ListHandler) GetMaxListPositionHandler(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	position, err := h.service.GetMaxListPosition(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error getting max position", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"max_position": position,
	})
}

func (h *ListHandler) CountListsByBoardHandler(c *fiber.Ctx) error {
	boardIDStr := c.Params("boardId")
	boardID, err := strconv.ParseInt(boardIDStr, 10, 32)
	if err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}

	count, err := h.service.CountListsByBoard(c.Context(), int32(boardID))
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error counting lists", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"count": count,
	})
}
