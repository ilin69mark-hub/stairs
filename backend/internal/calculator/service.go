package calculator

import (
	"fmt"
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
		avgTread := 0.0
		for _, s := range steps { avgTread += s.TreadDepth }
		if stepsCount > 0 { avgTread = avgTread / float64(stepsCount) }
		totalRun := float64(stepsCount) * avgTread
		inclination = math.Atan(totalRise / totalRun) * 180 / math.Pi
	}

	materialCost, err := CalculateMaterialCost(ctx, config.Material, steps)
	if err != nil { return nil, fmt.Errorf("material cost error: %w", err) }
	workCost, err := CalculateWorkCost(ctx, config.Type, steps)
	if err != nil { return nil, fmt.Errorf("work cost error: %w", err) }

	var railingCost float64
	if config.Railing != "" {
		railingLength := EstimateRailingLength(steps)
		railingCost, err = CalculateRailingCost(ctx, config.Railing, railingLength)
		if err != nil { return nil, fmt.Errorf("railing cost error: %w", err) }
	}

	var coatingCost float64
	if config.Coating != "" {
		area := EstimateCoatingArea(steps)
		coatingCost, err = CalculateCoatingCost(ctx, config.Coating, area)
		if err != nil { return nil, fmt.Errorf("coating cost error: %w", err) }
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