package calculator

import (
	"context"
	"errors"
	"math"

	"github.com/yourorg/stairs-backend/internal/models"
)

type CalculationService struct{}

func NewCalculationService() *CalculationService {
	return &CalculationService{}
}

func (s *CalculationService) Calculate(ctx context.Context, config models.StairConfig) (*models.CalculationResult, error) {
	var steps []models.StepPosition
	var err error

	switch config.Type {
	case "straight", "direct":
		steps, err = CalcStraight(config)
	case "l-shaped", "l-shape":
		steps, err = CalcLShaped(config)
	case "u-shaped", "p-shaped":
		steps, err = CalcUShaped(config)
	case "spiral", "winding":
		steps, err = CalcSpiral(config)
	default:
		return nil, errors.New("unknown stair type")
	}

	if err != nil {
		return nil, err
	}

	stepsCount := len(steps)
	var totalRise float64

	for _, step := range steps {
		totalRise += step.RiseHeight
	}

	inclination := 0.0
	if stepsCount > 0 {
		avgTread := 270.0
		totalRun := float64(stepsCount) * avgTread
		inclination = math.Atan(totalRise / totalRun) * 180 / math.Pi
	}

	materialCost, _ := CalculateMaterialCost(ctx, config.Material, steps)
	workCost, _ := CalculateWorkCost(ctx, config.Type, steps)

	var railingCost float64
	if config.Railing != "" {
		railingLength := EstimateRailingLength(steps)
		railingCost, _ = CalculateRailingCost(ctx, config.Railing, railingLength)
	}

	var coatingCost float64
	if config.Coating != "" {
		area := EstimateCoatingArea(steps)
		coatingCost, _ = CalculateCoatingCost(ctx, config.Coating, area)
	}

	totalPrice := materialCost + workCost + railingCost + coatingCost

	return &models.CalculationResult{
		Steps:          steps,
		TotalSteps:     stepsCount,
		Inclination:    inclination,
		IsValid:        true,
		MaterialCost:   materialCost,
		WorkCost:       workCost,
		RailingCost:    railingCost,
		CoatingCost:    coatingCost,
		TotalPrice:     totalPrice,
	}, nil
}

type GeometryService struct{}