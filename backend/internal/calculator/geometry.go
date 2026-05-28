package calculator

import (
	"math"

	"github.com/yourorg/stairs-backend/internal/models"
)

const (
	IdealRise        = 175.0
	MinRise          = 150.0
	MaxRise          = 200.0
	MinTread         = 250.0
	MaxTread         = 350.0
	ComfortFormula   = 620.0
	MinStepsPerMarch = 3
	WinderStepsL     = 5
	WinderStepsU     = 3
)

func clamp(value, min, max float64) float64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func calculateStepsCount(floorHeight float64) int {
	stepsCount := int(math.Round(floorHeight / IdealRise))
	if stepsCount < MinStepsPerMarch {
		stepsCount = MinStepsPerMarch
	}
	rise := floorHeight / float64(stepsCount)
	if rise < MinRise {
		stepsCount = int(math.Ceil(floorHeight / MinRise))
	} else if rise > MaxRise {
		stepsCount = int(math.Ceil(floorHeight / MaxRise))
	}
	if stepsCount < MinStepsPerMarch {
		stepsCount = MinStepsPerMarch
	}
	return stepsCount
}

func calculateTreadDepth(rise float64) float64 {
	tread := ComfortFormula - 2*rise
	return clamp(tread, MinTread, MaxTread)
}

func CalcStraight(config models.StairConfig) ([]models.StepPosition, error) {
	stepsCount := calculateStepsCount(config.FloorHeight)
	rise := config.FloorHeight / float64(stepsCount)
	treadDepth := calculateTreadDepth(rise)

	steps := make([]models.StepPosition, 0, stepsCount)
	for i := 0; i < stepsCount; i++ {
		steps = append(steps, models.StepPosition{
			Index:      i,
			Position:   [3]float64{0, float64(i+1) * rise, float64(i) * treadDepth},
			RotationY:  0,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}
	return steps, nil
}

func CalcLShaped(config models.StairConfig) ([]models.StepPosition, error) {
	stepsCount := calculateStepsCount(config.FloorHeight)
	rise := config.FloorHeight / float64(stepsCount)
	treadDepth := calculateTreadDepth(rise)

	winderCount := WinderStepsL
	straightTotal := stepsCount - winderCount
	lowerSteps := straightTotal / 2
	upperSteps := straightTotal - lowerSteps

	steps := make([]models.StepPosition, 0, stepsCount)

	// Lower flight: along +Z, center X = stepWidth/2 (wall at x=0)
	for i := 0; i < lowerSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{config.StepWidth / 2, float64(len(steps)+1) * rise, float64(i)*treadDepth + treadDepth/2},
			RotationY:  0,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastLowerZ := float64(lowerSteps) * treadDepth

	// Winder section: 90° turn around inner corner
	innerR := math.Max(treadDepth*0.15, 50)
	outerR := config.StepWidth
	midR := (innerR + outerR) / 2
	pivotX := 0.0
	pivotZ := lastLowerZ - innerR
	totalAngle := math.Pi / 2
	stepAngle := totalAngle / float64(winderCount)

	for i := 0; i < winderCount; i++ {
		midAngle := (float64(i) + 0.5) * stepAngle
		cx := pivotX + midR*math.Sin(midAngle)
		cz := pivotZ + midR*math.Cos(midAngle)

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{cx, float64(len(steps)+1) * rise, cz},
			RotationY:  midAngle,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastWinder := steps[len(steps)-1]
	lastWinderX := lastWinder.Position[0]
	lastWinderZ := lastWinder.Position[2]

	// Upper flight: along +X, rotationY=PI/2
	for i := 0; i < upperSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{lastWinderX + float64(i)*treadDepth + treadDepth/2, float64(len(steps)+1) * rise, lastWinderZ + config.StepWidth/2},
			RotationY:  math.Pi / 2,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	return steps, nil
}

func CalcUShaped(config models.StairConfig) ([]models.StepPosition, error) {
	stepsCount := calculateStepsCount(config.FloorHeight)
	rise := config.FloorHeight / float64(stepsCount)
	treadDepth := calculateTreadDepth(rise)

	winderPerTurn := WinderStepsU
	totalWinders := winderPerTurn * 2
	straightTotal := stepsCount - totalWinders
	segmentSteps := straightTotal / 3
	upperSteps := straightTotal - segmentSteps*2

	steps := make([]models.StepPosition, 0, stepsCount)
	radius := config.StepWidth / 2

	// Lower flight: along +Z, center X = 0
	for i := 0; i < segmentSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(len(steps)+1) * rise, float64(i)*treadDepth + treadDepth/2},
			RotationY:  0,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lowerEndZ := float64(segmentSteps) * treadDepth
	pivotZ1 := lowerEndZ

	// First 180° turn: +Z -> -Z through +X
	for i := 0; i < winderPerTurn; i++ {
		t := (float64(i) + 0.5) / float64(winderPerTurn)
		angle := t * math.Pi

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{-math.Sin(angle) * radius, float64(len(steps)+1) * rise, pivotZ1 + (1-math.Cos(angle))*radius},
			RotationY:  -angle,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastFirstWinderZ := steps[len(steps)-1].Position[2]

	// Middle flight: along -Z, rotationY=PI, center X = 0
	for i := 0; i < segmentSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(len(steps)+1) * rise, lastFirstWinderZ - float64(i+1)*treadDepth},
			RotationY:  math.Pi,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastMiddleFlightZ := steps[len(steps)-1].Position[2]
	pivotZ2 := lastMiddleFlightZ + treadDepth/2

	// Second 180° turn: -Z -> +Z through -X
	for i := 0; i < winderPerTurn; i++ {
		t := (float64(i) + 0.5) / float64(winderPerTurn)
		angle := t * math.Pi

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{-math.Sin(angle) * radius, float64(len(steps)+1) * rise, pivotZ2 + (1-math.Cos(angle))*radius},
			RotationY:  -angle - math.Pi,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastSecondWinderZ := steps[len(steps)-1].Position[2]

	// Upper flight: along +Z, rotationY=0, center X = 0
	for i := 0; i < upperSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(len(steps)+1) * rise, lastSecondWinderZ + float64(i+1)*treadDepth},
			RotationY:  0,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	return steps, nil
}

func CalcSpiral(config models.StairConfig) ([]models.StepPosition, error) {
	stepsCount := calculateStepsCount(config.FloorHeight)
	if stepsCount < 5 {
		stepsCount = 5
	}
	rise := config.FloorHeight / float64(stepsCount)
	radius := config.OpeningWidth/2 - 100
	if radius < 200 {
		radius = 200
	}

	totalAngle := 2*math.Pi + float64(stepsCount)/10*math.Pi
	anglePerStep := totalAngle / float64(stepsCount)
	treadDepth := radius * anglePerStep

	steps := make([]models.StepPosition, stepsCount)
	for i := 0; i < stepsCount; i++ {
		angle := float64(i) * anglePerStep
		steps[i] = models.StepPosition{
			Index:      i,
			Position:   [3]float64{radius * math.Cos(angle), float64(i+1) * rise, radius * math.Sin(angle)},
			RotationY:  angle + math.Pi/2,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		}
	}
	return steps, nil
}
