package calculator

import (
	"context"
	"math"

	"github.com/yourorg/stairs-backend/internal/models"
)

var defaultPrices = map[string]float64{
	"oak":     1500,
	"beech":   1200,
	"ash":     1000,
	"pine":    800,
	"metal":   2000,
	"glass":   2500,
}

var defaultWorkPrices = map[string]float64{
	"straight":   500,
	"direct":     500,
	"l-shaped":   700,
	"l-shape":    700,
	"u-shaped":   900,
	"p-shaped":   900,
	"spiral":     1200,
	"winding":    1200,
}

var winderMultiplier = 1.5

var defaultRailingPrices = map[string]float64{
	"wood":    300,
	"metal":   500,
	"glass":   800,
}

var defaultCoatingPrices = map[string]float64{
	"varnish-matte":  150,
	"varnish-glossy": 180,
	"oil":            200,
	"paint":          120,
}

func CalculateMaterialCost(ctx context.Context, materialSlug string, steps []models.StepPosition) (float64, error) {
	pricePerUnit := defaultPrices["oak"]
	if price, ok := defaultPrices[materialSlug]; ok {
		pricePerUnit = price
	}

	var totalVolume float64
	for _, step := range steps {
		width := step.Width
		if width == 0 {
			width = 900
		}
		volume := step.TreadDepth * width * step.RiseHeight / 1_000_000_000
		totalVolume += volume
	}

	return pricePerUnit * totalVolume, nil
}

func CalculateWorkCost(ctx context.Context, stairType string, steps []models.StepPosition) (float64, error) {
	basePricePerStep := defaultWorkPrices["straight"]
	if price, ok := defaultWorkPrices[stairType]; ok {
		basePricePerStep = price
	}

	var totalCost float64
	for _, step := range steps {
		price := basePricePerStep
		if step.IsWinder {
			price = basePricePerStep * winderMultiplier
		}
		totalCost += price
	}

	return totalCost, nil
}

func CalculateRailingCost(ctx context.Context, railingSlug string, length float64) (float64, error) {
	pricePerMeter := defaultRailingPrices["wood"]
	if price, ok := defaultRailingPrices[railingSlug]; ok {
		pricePerMeter = price
	}
	return pricePerMeter * length, nil
}

func CalculateCoatingCost(ctx context.Context, coatingSlug string, area float64) (float64, error) {
	pricePerM2 := defaultCoatingPrices["varnish-matte"]
	if price, ok := defaultCoatingPrices[coatingSlug]; ok {
		pricePerM2 = price
	}
	return pricePerM2 * area, nil
}

func EstimateRailingLength(steps []models.StepPosition) float64 {
	if len(steps) < 2 {
		return 0
	}

	var totalLength float64
	for i := 1; i < len(steps); i++ {
		dx := steps[i].Position[0] - steps[i-1].Position[0]
		dy := steps[i].Position[1] - steps[i-1].Position[1]
		dz := steps[i].Position[2] - steps[i-1].Position[2]
		segmentLength := math.Sqrt(dx*dx + dy*dy + dz*dz)
		totalLength += segmentLength
	}

	return totalLength * 2
}

func EstimateCoatingArea(steps []models.StepPosition) float64 {
	if len(steps) == 0 {
		return 0
	}

	var totalArea float64
	for _, step := range steps {
		width := step.Width
		if width == 0 {
			width = 900
		}
		treadArea := (step.TreadDepth * width) / 1_000_000
		riserArea := (step.RiseHeight * width) / 1_000_000
		totalArea += treadArea + riserArea
	}

	return totalArea
}