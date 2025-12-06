package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/K44Z/boardly/internal/user/services"
	"github.com/K44Z/boardly/shared/schemas"
	"github.com/K44Z/boardly/shared/utils"
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
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=128"`
	Username string `json:"username" validate:"required,min=2,max=50,alphanum"`
}
type SearchUserRequest struct {
	Query string `json:"query" validate:"required,min=1,max=100"`
}
type GetUserByIdRequest struct {
	Id string `json:"id" validate:"required,numeric"`
}

func (h *UserHandler) Login(c *fiber.Ctx) error {
	req := &LoginRequest{}
	if err := c.BodyParser(req); err != nil {
		utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), err)
	}
	fmt.Println(req)
	user, err := h.service.CheckUser(c.Context(), &req.Email)
	if err != nil {
		utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), err)
	}
	fmt.Println(user.Password, req.Password)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.SendError(c, fiber.StatusBadRequest, fiber.ErrBadRequest.Error(), err)
	}
	token, err := utils.GenerateJWTtoken(&schemas.User{
		Username: user.Username,
		ID:       user.ID,
	})
	if err != nil {
		log.Println(err)
		utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"token": token,
		"user":  user,
	})

}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	req := &RegisterRequest{}
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	user, err := h.service.CheckUser(c.Context(), &req.Email)
	if err != nil && !errors.Is(err, utils.UserNotFound) || user != nil {
		if user != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "User already exists",
			})
		}
		utils.SendError(c, http.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
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
		utils.SendError(c, http.StatusInternalServerError, "", err)

	}
	return c.Status(200).JSON(fiber.Map{})
}

func (h *UserHandler) SearchUsersHandler(c *fiber.Ctx) error {
	req := &SearchUserRequest{}
	if err := c.BodyParser(req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, utils.ParsingError.Error(), err)
	}
	users, err := h.service.SearchUsers(c.Context(), &req.Query)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error seaching users :", err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"users": users,
	})
}

func (h *UserHandler) UploadProfileImage(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Image is required", err)
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "./static/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to create upload directory", err)
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), "profile", ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveFile(file, filePath); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to save image", err)
	}

	// Construct URL
	imageURL := fmt.Sprintf("%s://%s/static/uploads/%s", c.Protocol(), c.Get("Host"), filename)

	return h.updateUserProfileImage(c, imageURL)
}

func (h *UserHandler) updateUserProfileImage(c *fiber.Ctx, imageURL string) error {
	// Extract user ID from token
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return utils.SendError(c, fiber.StatusUnauthorized, "Missing authorization header", nil)
	}

	// Assuming "Bearer <token>"
	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		return utils.SendError(c, fiber.StatusUnauthorized, "Invalid authorization header", nil)
	}
	token := authHeader[7:]

	user, err := utils.Authenticate(token)
	if err != nil {
		return utils.SendError(c, fiber.StatusUnauthorized, "Invalid token", err)
	}

	userID := user.ID

	if err := h.service.UpdateProfileImage(c.Context(), userID, imageURL); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Failed to update profile image", err)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message":   "Profile image updated successfully",
		"image_url": imageURL,
	})
}

func (h *UserHandler) GetUserByIdHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	idInt, err := strconv.Atoi(idStr)
	id := int32(idInt)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, utils.ParsingError.Error(), err)
	}
	user, err := h.service.GetUserById(c.Context(), &id)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "error gettting user", err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"user": *user,
	})
}

func (h *UserHandler) GetAllUsersHandler(c *fiber.Ctx) error {
	users, err := h.service.GetallUsers(c.Context())
	if err != nil {
		utils.SendError(c, fiber.StatusInternalServerError, fiber.ErrInternalServerError.Error(), err)
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"users": users,
	})

}
