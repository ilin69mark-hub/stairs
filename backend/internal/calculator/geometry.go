package calculator

import (
	"math"
	"github.com/yourorg/stairs-backend/internal/models"
)

const (
	IdealRise     = 175.0
	MinRise       = 150.0
	MaxRise       = 200.0
	MinTread      = 250.0
	MaxTread      = 350.0
	ComfortFormula = 620.0
	MinStepsPerMarch = 3
	WinderSteps   = 3
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

	winderCount := WinderSteps
	straightTotal := stepsCount - winderCount
	lowerSteps := int(math.Floor(float64(straightTotal) / 2))
	upperSteps := straightTotal - lowerSteps

	if lowerSteps < 3 {
		lowerSteps = 3
	}
	if upperSteps < 3 {
		upperSteps = 3
	}

	steps := make([]models.StepPosition, 0, stepsCount)

	// Нижний марш: вдоль +Z (X=0, Z растёт, Y растёт)
	for i := 0; i < lowerSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(i+1) * rise, float64(i) * treadDepth},
			RotationY:  0,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastLowerZ := float64(lowerSteps) * treadDepth

	// Забежной сектор: поворот на 90°
	for i := 0; i < winderCount; i++ {
		t := float64(i+1) / float64(winderCount+1)
		angle := t * math.Pi / 2
		radius := treadDepth * (0.6 + t*0.8)
		centerX := treadDepth
		centerZ := lastLowerZ

		x := centerX + math.Sin(angle)*radius
		y := float64(lowerSteps+i+1) * rise
		z := centerZ - math.Cos(angle)*radius + treadDepth

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{x, y, z},
			RotationY:  -angle,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastWinderX := steps[len(steps)-1].Position[0]
	lastWinderZ := steps[len(steps)-1].Position[2]

	// Верхний марш: вдоль +X (Z фиксирован, X растёт), rotationY=PI/2
	for i := 0; i < upperSteps; i++ {
		x := lastWinderX + float64(i) * treadDepth
		y := float64(lowerSteps+winderCount+i+1) * rise
		z := lastWinderZ

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{x, y, z},
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

	winderPerTurn := WinderSteps
	totalWinders := winderPerTurn * 2
	straightTotal := stepsCount - totalWinders
	segmentSteps := int(math.Floor(float64(straightTotal) / 3))
	upperSteps := straightTotal - segmentSteps*2

	steps := make([]models.StepPosition, 0, stepsCount)

	// Нижний марш: вдоль +Z (X=0, Z растёт)
	for i := 0; i < segmentSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(i+1) * rise, float64(i) * treadDepth},
			RotationY:  0,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	firstWinderZ := float64(segmentSteps-1) * treadDepth

	// Первый забежной сектор: поворот на 180°
	for i := 0; i < winderPerTurn; i++ {
		t := float64(i+1) / float64(winderPerTurn+1)
		angle := t * math.Pi
		radius := treadDepth * 0.8
		centerX := treadDepth
		centerZ := firstWinderZ

		x := centerX - math.Sin(angle)*radius
		y := float64(segmentSteps+i+1) * rise
		z := centerZ - math.Cos(angle)*radius + treadDepth

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{x, y, z},
			RotationY:  -angle,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastFirstWinderZ := steps[len(steps)-1].Position[2]

	// Средний марш: вдоль -Z (rotationY=PI)
	for i := 0; i < segmentSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(segmentSteps+winderPerTurn+i+1) * rise, lastFirstWinderZ - float64(i+1)*treadDepth},
			RotationY:  math.Pi,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	secondWinderZ := steps[len(steps)-1].Position[2]

	// Второй забежной сектор: поворот на 180°
	for i := 0; i < winderPerTurn; i++ {
		t := float64(i+1) / float64(winderPerTurn+1)
		angle := t * math.Pi
		radius := treadDepth * 0.8
		centerX := treadDepth
		centerZ := secondWinderZ

		x := centerX - math.Sin(angle)*radius
		y := float64(segmentSteps*2+winderPerTurn+i+1) * rise
		z := centerZ - math.Cos(angle)*radius + treadDepth

		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{x, y, z},
			RotationY:  -angle - math.Pi,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	lastSecondWinderZ := steps[len(steps)-1].Position[2]

	// Верхний марш: вдоль +Z (rotationY=0)
	for i := 0; i < upperSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{0, float64(segmentSteps*2+winderPerTurn*2+i+1) * rise, lastSecondWinderZ + float64(i+1)*treadDepth},
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
	stepsCount := int(math.Max(5, math.Round(config.FloorHeight/190)))
	rise := config.FloorHeight / float64(stepsCount)
	radius := config.OpeningWidth/2 - 100
	if radius < 200 {
		radius = 200
	}

	totalAngle := 2*math.Pi + float64(stepsCount)/10*math.Pi
	anglePerStep := totalAngle / float64(stepsCount)
	treadDepth := radius * anglePerStep * 0.8

	steps := make([]models.StepPosition, stepsCount)

	for i := 0; i < stepsCount; i++ {
		angle := float64(i) * anglePerStep
		x := radius * math.Cos(angle)
		z := radius * math.Sin(angle)

		steps[i] = models.StepPosition{
			Index:      i,
			Position:   [3]float64{x, float64(i+1) * rise, z},
			RotationY:  angle + math.Pi/2,
			IsWinder:   true,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		}
	}

	return steps, nil
}