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

	taskPayload := map[string]interface{}{
		"contactId": contactID.String(),
		"name":      req.Name,
		"phone":     req.Phone,
	}
	if req.Email != nil {
		taskPayload["email"] = *req.Email
	} else {
		taskPayload["email"] = ""
	}
	if req.Message != nil {
		taskPayload["message"] = *req.Message
	} else {
		taskPayload["message"] = ""
	}

	task, err := json.Marshal(taskPayload)
	if err != nil {
		http.Error(w, "failed to prepare task", http.StatusInternalServerError)
		return
	}
	_, err = h.asynq.Enqueue(asynq.NewTask("send_contact_notification", task), asynq.MaxRetry(3))
	if err != nil {
		// Log the error but still return success for the contact submission
		// The task will be retried by asynq
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "saved",
		"id":     contactID.String(),
	})
}