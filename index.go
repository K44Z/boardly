package main

import (
	br "github.com/K44Z/boardly/services/board/routes"

	bs "github.com/K44Z/boardly/services/board/services"
	ur "github.com/K44Z/boardly/services/user/routes"

	us "github.com/K44Z/boardly/services/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, db *schemas.DB) {
	BoardService := bs.NewBoardService(db)
	UserService := us.NewUserService(db)
	br.NewBoardRouter(app, &BoardService)
	ur.NewUserRouter(app, &UserService)
}
