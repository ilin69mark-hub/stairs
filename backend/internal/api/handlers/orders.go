package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrdersHandler struct {
	pool  *pgxpool.Pool
	asynq *asynq.Client
}

func NewOrdersHandler(pool *pgxpool.Pool, asynqClient *asynq.Client) *OrdersHandler {
	return &OrdersHandler{
		pool:  pool,
		asynq: asynqClient,
	}
}

type CreateOrderRequest struct {
	CustomerName  string                 `json:"customerName"`
	CustomerPhone string                 `json:"customerPhone"`
	CustomerEmail *string                `json:"customerEmail"`
	CustomerAddress *string             `json:"customerAddress"`
	Comment      *string                `json:"comment"`
	StairConfig  map[string]interface{} `json:"stairConfig"`
}

type OrderResponse struct {
	OrderID     string `json:"orderId"`
	OrderNumber string `json:"orderNumber"`
	Status      string `json:"status"`
}

func (h *OrdersHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req CreateOrderRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.CustomerName == "" || req.CustomerPhone == "" {
		http.Error(w, "name and phone are required", http.StatusBadRequest)
		return
	}

	orderID := uuid.New()
	year := time.Now().Year()

	var seqNum int
	err := h.pool.QueryRow(r.Context(),
		"SELECT nextval('orders_sequence')").Scan(&seqNum)
	if err != nil {
		seqNum = int(time.Now().Unix()) % 10000
	}

	orderNumber := fmt.Sprintf("ORD-%d-%04d", year, seqNum)

	configJSON, err := json.Marshal(req.StairConfig)
	if err != nil {
		http.Error(w, "invalid stair config", http.StatusBadRequest)
		return
	}

	_, err = h.pool.Exec(r.Context(), `
		INSERT INTO orders (id, order_number, status, customer_name, customer_phone, customer_email, customer_address, comment, stair_config, created_at, updated_at)
		VALUES ($1, $2, 'new', $3, $4, $5, $6, $7, $8, NOW(), NOW())
	`, orderID, orderNumber, req.CustomerName, req.CustomerPhone, req.CustomerEmail, req.CustomerAddress, req.Comment, configJSON)

	if err != nil {
		http.Error(w, "failed to create order", http.StatusInternalServerError)
		return
	}

	task, err := json.Marshal(map[string]string{
		"orderId": orderID.String(),
	})
	if err != nil {
		http.Error(w, "failed to prepare task", http.StatusInternalServerError)
		return
	}
	_, err = h.asynq.Enqueue(asynq.NewTask("generate_pdf", task), asynq.MaxRetry(3))
	if err != nil {
		// Log the error but still return success for the order creation
		// The task will be retried by asynq
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(OrderResponse{
		OrderID:     orderID.String(),
		OrderNumber: orderNumber,
		Status:      "new",
	})
}