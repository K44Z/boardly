package utils

import (
	"errors"

	"github.com/gofiber/fiber/v2"
)

var UserNotFound = errors.New("User not found")
var ParsingError = errors.New("Error parsing request")
var ErrNotFound = errors.New("Not found")

func SendError(c *fiber.Ctx, status int, msg string, err error) error {
	return c.Status(status).JSON(fiber.Map{
		"error": msg + " : " + err.Error(),
	})
}
