package main

import (
	br "github.com/K44Z/boardly/internal/board/routes"

	bs "github.com/K44Z/boardly/internal/board/services"
	ur "github.com/K44Z/boardly/internal/user/routes"

	us "github.com/K44Z/boardly/internal/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, db *schemas.DB) {
	BoardService := bs.NewBoardService(db)
	UserService := us.NewUserService(db)
	br.NewBoardRouter(app, &BoardService)
	ur.NewUserRouter(app, &UserService)
}
