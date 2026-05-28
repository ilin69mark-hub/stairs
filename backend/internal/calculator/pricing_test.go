package calculator

import (
    "math"
    "testing"
    "github.com/yourorg/stairs-backend/internal/models"
)

func TestEstimateRailingLength_Straight(t *testing.T) {
    steps := []models.StepPosition{{Position: [3]float64{0, 0, 0}}, {Position: [3]float64{0, 0, 1000}}}
    length := EstimateRailingLength(steps)
    expected := 1000.0
    if math.Abs(length-expected) > 1e-6 {
        t.Fatalf("expected %v, got %v", expected, length)
    }
}
