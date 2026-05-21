package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"

	"github.com/yourorg/stairs-backend/internal/calculator"
	"github.com/yourorg/stairs-backend/internal/models"
)

type CalculatorHandler struct {
	calc *calculator.CalculationService
}

func NewCalculatorHandler(calc *calculator.CalculationService, redisClient interface{}) *CalculatorHandler {
	return &CalculatorHandler{
		calc: calc,
	}
}

func (h *CalculatorHandler) CalculatePrecise(w http.ResponseWriter, r *http.Request) {
	var config models.StairConfig

	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	validate := validator.New()
	if err := validate.Struct(&config); err != nil {
		http.Error(w, "validation failed", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	result, err := h.calc.Calculate(ctx, config)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}