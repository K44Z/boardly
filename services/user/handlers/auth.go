package handlers

import (
	"errors"
	"log"
	"net/http"

	"github.com/K44Z/boardly/schemas"
	"github.com/K44Z/boardly/services/user/services"
	"github.com/K44Z/boardly/services/user/utils"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	service services.UserService
}

func NewUserHandler(s *services.UserService) *UserHandler {
	return &UserHandler{service: *s}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

func (h *UserHandler) Login(c *fiber.Ctx) error {
	req := &LoginRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid credentials : " + err.Error(),
		})
	}
	user, err := h.service.CheckUser(c.Context(), req.Email)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User already exists : " + err.Error(),
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Println(err)
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error() + " / " + user.Password + " / " + req.Password,
		})
	}
	token, err := utils.GenerateJWTtoken(&schemas.User{
		Username: user.Username,
		ID:       user.ID,
	})
	if err != nil {
		log.Println(err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})

	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"token": token,
	})

}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	req := &RegisterRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	user, err := h.service.CheckUser(c.Context(), req.Email)
	if err != nil && !errors.Is(err, utils.UserNotFound) || user != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v\n", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err = h.service.Register(c.Context(), &schemas.User{
		Email:    req.Email,
		Password: string(hashedPass),
		Username: req.Username,
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.SendStatus(http.StatusCreated)
}
