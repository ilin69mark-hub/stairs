package handlers

import (
	"encoding/json"
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
	Name    string  `json:"name"`
	Phone   string  `json:"phone"`
	Email   *string `json:"email"`
	Message *string `json:"message"`
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

	contactID := uuid.New()

	_, err := h.pool.Exec(r.Context(), `
		INSERT INTO contacts (id, name, phone, email, message, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
	`, contactID, req.Name, req.Phone, req.Email, req.Message)

	if err != nil {
		http.Error(w, "failed to save contact", http.StatusInternalServerError)
		return
	}

	task, _ := json.Marshal(map[string]string{
		"contactId": contactID.String(),
		"name":      req.Name,
		"phone":     req.Phone,
		"email":     *req.Email,
	})
	h.asynq.Enqueue(asynq.NewTask("send_contact_notification", task), asynq.MaxRetry(3))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "saved",
		"id":     contactID.String(),
	})
}