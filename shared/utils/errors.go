package utils

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

var UserNotFound = errors.New("User not found")
var ParsingError = errors.New("Error parsing request")
var ErrNotFound = errors.New("Not found")
var BadRequest = errors.New("Bad request")

func SendError(c *fiber.Ctx, status int, msg string, err error) error {
	var message string
	if err == nil {
		message = msg
	} else {
		message = msg + " : " + err.Error()
	}
	if err != nil {
		log.Error(err)
	}
	return c.Status(status).JSON(fiber.Map{
		"error": message,
	})
}
