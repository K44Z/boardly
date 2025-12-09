package handlers

import (
	"net/http"
	"strconv"

	"github.com/K44Z/boardly/internal/analytics/services"
	"github.com/gofiber/fiber/v2"
)

type AnalyticsHandler struct {
	service services.AnalyticsService
}

func NewAnalyticsHandler(s services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		service: s,
	}
}

func (h *AnalyticsHandler) GetBoardAnalytics(c *fiber.Ctx) error {
	boardIdParam := c.Params("id")
	boardId, err := strconv.Atoi(boardIdParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid board ID",
		})
	}

	analytics, err := h.service.GetBoardAnalytics(c.Context(), int32(boardId))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch board analytics",
		})
	}

	return c.JSON(analytics)
}
