package mq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	queue   amqp.Queue
}

type EmailNotification struct {
	UserID  int32  `json:"user_id"`
	BoardID int32  `json:"board_id"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

func NewRabbitMQ(url string) (*RabbitMQ, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open a channel: %w", err)
	}

	q, err := ch.QueueDeclare(
		"board_assignments", // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return nil, fmt.Errorf("failed to declare a queue: %w", err)
	}

	return &RabbitMQ{
		conn:    conn,
		channel: ch,
		queue:   q,
	}, nil
}

func (r *RabbitMQ) PublishAssignment(ctx context.Context, notification EmailNotification) error {
	body, err := json.Marshal(notification)
	if err != nil {
		return fmt.Errorf("failed to marshal notification: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	err = r.channel.PublishWithContext(ctx,
		"",           // exchange
		r.queue.Name, // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		return fmt.Errorf("failed to publish a message: %w", err)
	}

	return nil
}

func (r *RabbitMQ) Close() {
	if r.channel != nil {
		r.channel.Close()
	}
	if r.conn != nil {
		r.conn.Close()
	}
}

func (r *RabbitMQ) Consume(handler func(EmailNotification) error) error {
	msgs, err := r.channel.Consume(
		r.queue.Name, // queue
		"",           // consumer
		true,         // auto-ack
		false,        // exclusive
		false,        // no-local
		false,        // no-wait
		nil,          // args
	)
	if err != nil {
		return fmt.Errorf("failed to register a consumer: %w", err)
	}

	go func() {
		for d := range msgs {
			var notification EmailNotification
			if err := json.Unmarshal(d.Body, &notification); err != nil {
				log.Printf("Error decoding message: %s", err)
				continue
			}

			if err := handler(notification); err != nil {
				log.Printf("Error handling message: %s", err)
			}
		}
	}()

	return nil
}
