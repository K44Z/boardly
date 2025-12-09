package routes

import (
"github.com/K44Z/boardly/internal/analytics/handlers"
"github.com/K44Z/boardly/internal/analytics/services"
"github.com/gofiber/fiber/v2"
)

func RegisterAnalyticsRoutes(router fiber.Router, service services.AnalyticsService) {
	handler := handlers.NewAnalyticsHandler(service)

	analytics := router.Group("/analytics")
	analytics.Get("/board/:id", handler.GetBoardAnalytics)
}
