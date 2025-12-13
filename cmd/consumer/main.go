package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/K44Z/boardly/internal/mq"
	brevo "github.com/getbrevo/brevo-go/lib"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default config")
	}

	rabbitMQUrl := os.Getenv("RABBITMQ_URL")
	if rabbitMQUrl == "" {
		rabbitMQUrl = "amqp://guest:guest@localhost:5672/"
	}

	rabbitMQ, err := mq.NewRabbitMQ(rabbitMQUrl)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer rabbitMQ.Close()

	log.Println("Connected to RabbitMQ, waiting for messages...")

	err = rabbitMQ.Consume(func(notification mq.EmailNotification) error {
		fmt.Printf("Sending email to: %s\n", notification.Email)
		err := Send(notification)
		if err != nil {
			return err
		}
		fmt.Printf("Subject: Board Assignment\n")
		fmt.Printf("Body: %s\n", notification.Message)
		return nil
	})
	if err != nil {
		log.Fatalf("Failed to start consumer: %v", err)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down consumer...")
}

func Send(notification mq.EmailNotification) error {
	apiKey := os.Getenv("Brevo")
	var ctx context.Context
	cfg := brevo.NewConfiguration()
	cfg.AddDefaultHeader("api-key", apiKey)
	cfg.AddDefaultHeader("partner-key", apiKey)

	br := brevo.NewAPIClient(cfg)
	result, resp, err := br.AccountApi.GetAccount(ctx)
	if err != nil {
		fmt.Println("Error when calling AccountApi->get_account: ", err.Error())
		return err
	}
	fmt.Println("GetAccount Object:", result, " GetAccount Response: ", resp)
	return nil
}
