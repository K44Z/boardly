package handlers

import (
	"errors"
	"net/http"
	"os"
	"strconv"
	"time"

	rtc "github.com/AgoraIO-Community/go-tokenbuilder/rtctokenbuilder"
	"github.com/K44Z/boardly/internal/board/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/K44Z/boardly/shared/utils"
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
	Name string `json:"name" validate:"required,min=1,max=100"`
}

type UpdateBoardRequest struct {
	Name string `json:"name" validate:"required,min=1,max=100"`
}

func (h *BoardHandler) CreateBoardHandler(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(*schemas.User)
	if !ok || user == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	req := &CreateBoardRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body: " + err.Error(),
		})
	}

	board, err := h.service.CreateBoard(c.Context(), &req.Name, &user.ID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error creating board: " + err.Error(),
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"board": board,
	})
}

func (h *BoardHandler) GetBoardByIdHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid board ID: " + err.Error(),
		})
	}
	id := int32(idInt)

	res, err := h.service.GetBoardByID(c.Context(), &id)
	if err != nil {
		return utils.SendError(c, http.StatusNotFound, "Board not found", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"board": res,
	})
}

func (h *BoardHandler) ListUserBoardsHandler(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(*schemas.User)
	if !ok || user == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	boards, err := h.service.ListBoardsByUser(c.Context(), &user.ID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error fetching boards: " + err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"boards": boards,
	})
}

func (h *BoardHandler) UpdateBoardHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid board ID: " + err.Error(),
		})
	}
	id := int32(idInt)

	req := &UpdateBoardRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body: " + err.Error(),
		})
	}

	board, err := h.service.UpdateBoard(c.Context(), &id, &req.Name)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error updating board: " + err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"board": board,
	})
}

func (h *BoardHandler) DeleteBoardHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid board ID: " + err.Error(),
		})
	}
	id := int32(idInt)

	err = h.service.DeleteBoard(c.Context(), &id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error deleting board: " + err.Error(),
		})
	}

	return c.SendStatus(http.StatusNoContent)
}

func (h *BoardHandler) GetFullBoardHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	if idStr == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "id cannot be empty", errors.New("id cannot be empty"))
	}
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	id := int32(idInt)
	board, err := h.service.GetFullBoard(c.Context(), &id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	return c.Status(200).JSON(fiber.Map{
		"board": board,
	})
}

func (h *BoardHandler) GetAgoraTokenHandler(c *fiber.Ctx) error {
	boardID := c.Params("id")
	channelName := "board-" + boardID

	user, ok := c.Locals("user").(*schemas.User)
	if !ok || user == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	appID := os.Getenv("AGORA_APP_ID")
	appCertificate := os.Getenv("AGORA_APP_CERTIFICATE")

	if appID == "" || appCertificate == "" {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Agora configuration missing",
		})
	}

	expireTimeInSeconds := uint32(3600 * 24)
	currentTimestamp := uint32(time.Now().Unix())
	privilegeExpiredTs := currentTimestamp + expireTimeInSeconds

	uid := uint32(user.ID)

	token, err := rtc.BuildTokenWithUid(appID, appCertificate, channelName, uid, rtc.RolePublisher, privilegeExpiredTs)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"token":   token,
		"appId":   appID,
		"uid":     uid,
		"channel": channelName,
	})
}
