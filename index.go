package main

import (
	ai "github.com/K44Z/boardly/internal/ai"
	an "github.com/K44Z/boardly/internal/analytics/routes"
	br "github.com/K44Z/boardly/internal/board/routes"
	ca "github.com/K44Z/boardly/internal/card/routes"
	la "github.com/K44Z/boardly/internal/label/routes"
	li "github.com/K44Z/boardly/internal/list/routes"
	ur "github.com/K44Z/boardly/internal/user/routes"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, services *Services, db *schemas.DB) {
	br.NewBoardRouter(app, &services.BoardService)
	ur.NewUserRouter(app, &services.UserService)
	la.SetupLabelRoutes(app, &services.LabelService)
	li.NewListRouter(app, &services.ListService)
	ca.NewCardRouter(app, &services.CardService)
	ai.NewAiRouter(app, &services.AIService)
	an.RegisterAnalyticsRoutes(app, services.AnalyticsService)
}
