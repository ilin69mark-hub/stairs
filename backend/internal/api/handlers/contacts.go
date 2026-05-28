package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContactsHandler struct {
	pool  *pgxpool.Pool
	asynq *asynq.Client
}

func NewContactsHandler(pool *pgxpool.Pool, asynqClient *asynq.Client) *ContactsHandler {
	return &ContactsHandler{
		pool:  pool,
		asynq: asynqClient,
	}
}

type ContactRequest struct {
	Name    string  `json:"name" validate:"required,max=100"`
	Phone   string  `json:"phone" validate:"required,max=20"`
	Email   *string `json:"email"`
	Message *string `json:"message" validate:"omitempty,max=2000"`
}

func (h *ContactsHandler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	var req ContactRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Phone == "" {
		http.Error(w, "name and phone are required", http.StatusBadRequest)
		return
	}

	if len(req.Name) > 100 || len(req.Phone) > 20 {
		http.Error(w, "name or phone too long", http.StatusBadRequest)
		return
	}

	contactID := uuid.New()

	_, err := h.pool.Exec(r.Context(), `
		INSERT INTO contacts (id, name, phone, email, message, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
	`, contactID, req.Name, req.Phone, req.Email, req.Message)

	if err != nil {
		log.Printf("failed to save contact: %v", err)
		http.Error(w, "failed to save contact", http.StatusInternalServerError)
		return
	}

	email := ""
	if req.Email != nil {
		email = *req.Email
	}

	task, err := json.Marshal(map[string]string{
		"contactId": contactID.String(),
		"name":      req.Name,
		"phone":     req.Phone,
		"email":     email,
	})
	if err != nil {
		log.Printf("failed to marshal contact task: %v", err)
	} else {
		if _, err := h.asynq.Enqueue(asynq.NewTask("send_contact_notification", task), asynq.MaxRetry(3)); err != nil {
			log.Printf("failed to enqueue contact notification: %v", err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "saved",
		"id":     contactID.String(),
	})
}