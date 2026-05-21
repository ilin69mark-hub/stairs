package tasks

import (
	"context"
	"encoding/json"
	"log"

	"github.com/hibiken/asynq"
)

type Server struct {
	server *asynq.Server
}

func NewAsynqServer(redisAddr string) *Server {
	server := asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{
			Concurrency: 10,
		},
	)

	s := &Server{server: server}

	mux := asynq.NewServeMux()
	mux.HandleFunc("generate_pdf", s.handleGeneratePDF)
	mux.HandleFunc("send_contact_notification", s.handleSendContactNotification)

	go func() {
		if err := server.Run(mux); err != nil {
			log.Printf("asynq server error: %v", err)
		}
	}()

	return s
}

func (s *Server) handleGeneratePDF(ctx context.Context, task *asynq.Task) error {
	var payload map[string]string
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return err
	}

	log.Printf("generating pdf for order: %s", payload["orderId"])

	return nil
}

func (s *Server) handleSendContactNotification(ctx context.Context, task *asynq.Task) error {
	var payload map[string]string
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return err
	}

	log.Printf("sending contact notification: name=%s, phone=%s", payload["name"], payload["phone"])

	return nil
}

func (s *Server) Stop() {
	s.server.Shutdown()
}