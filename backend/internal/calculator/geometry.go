package calculator

import (
	"fmt"
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
	MinWinderWidthNarrow = 100.0
	MinWinderWidthCenter = 200.0
	MinStairWidth = 900.0
	WinderRadiusFactor = 0.8
	WinderRadiusMinFactor = 0.6
	WinderRadiusMaxFactor = 1.4
	SpiralRadiusOffset = 100.0
	SpiralMinRadius = 200.0
	SpiralTreadFactor = 0.8
	UShapedTurnOffsetFactor = 1.0
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

func validateSnip(rise, tread, inclination float64, stepsCount int) []string {
	var warnings []string

	if rise < MinRise || rise > MaxRise {
		warnings = append(warnings, fmt.Sprintf("Rise %.1fmm is outside SNIP range (%.0f-%.0fmm)", rise, MinRise, MaxRise))
	}

	if tread < MinTread || tread > MaxTread {
		warnings = append(warnings, fmt.Sprintf("Tread %.1fmm is outside SNIP range (%.0f-%.0fmm)", tread, MinTread, MaxTread))
	}

	if inclination < 30 || inclination > 45 {
		warnings = append(warnings, fmt.Sprintf("Inclination %.1f° is outside SNIP range (30-45°)", inclination))
	}

	if stepsCount < MinStepsPerMarch {
		warnings = append(warnings, fmt.Sprintf("Step count %d is below minimum %d", stepsCount, MinStepsPerMarch))
	}

	comfortValue := rise + 2*tread
	if math.Abs(comfortValue-ComfortFormula) > 20 {
		warnings = append(warnings, fmt.Sprintf("Comfort formula deviation: %.1f differs from ideal %.0f by more than 20", comfortValue, ComfortFormula))
	}

	return warnings
}

func validateWinderSteps(steps []models.StepPosition) []string {
	var warnings []string

	for _, step := range steps {
		if !step.IsWinder {
			continue
		}

		narrowWidth := step.Width * 0.3
		centerWidth := step.Width * 0.5

		if narrowWidth < MinWinderWidthNarrow {
			warnings = append(warnings, fmt.Sprintf("Winder step %d: narrow width %.0fmm is below minimum %.0fmm", step.Index, narrowWidth, MinWinderWidthNarrow))
		}

		if centerWidth < MinWinderWidthCenter {
			warnings = append(warnings, fmt.Sprintf("Winder step %d: center width %.0fmm is below minimum %.0fmm", step.Index, centerWidth, MinWinderWidthCenter))
		}
	}

	return warnings
}

func validateStairWidth(stepWidth float64) []string {
	var warnings []string
	if stepWidth < MinStairWidth {
		warnings = append(warnings, fmt.Sprintf("Stair width %.0fmm is below minimum %.0fmm", stepWidth, MinStairWidth))
	}
	return warnings
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
	turnRadius := math.Max(treadDepth*WinderRadiusFactor, config.OpeningLength*0.3)

	for i := 0; i < winderCount; i++ {
		t := float64(i+1) / float64(winderCount+1)
		angle := t * math.Pi / 2
		radius := treadDepth * (WinderRadiusMinFactor + t*(WinderRadiusFactor+WinderRadiusMinFactor))
		centerX := turnRadius
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
	turnRadius := math.Max(treadDepth*WinderRadiusFactor, config.OpeningLength*0.25)

	for i := 0; i < winderPerTurn; i++ {
		t := float64(i+1) / float64(winderPerTurn+1)
		angle := t * math.Pi
		radius := turnRadius
		centerX := turnRadius
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
	lateralOffset := turnRadius * UShapedTurnOffsetFactor

	for i := 0; i < segmentSteps; i++ {
		steps = append(steps, models.StepPosition{
			Index:      len(steps),
			Position:   [3]float64{lateralOffset, float64(segmentSteps+winderPerTurn+i+1) * rise, lastFirstWinderZ - float64(i+1)*treadDepth},
			RotationY:  math.Pi,
			IsWinder:   false,
			TreadDepth: treadDepth,
			RiseHeight: rise,
			Width:      config.StepWidth,
		})
	}

	secondWinderZ := steps[len(steps)-1].Position[2]

	for i := 0; i < winderPerTurn; i++ {
		t := float64(i+1) / float64(winderPerTurn+1)
		angle := t * math.Pi
		radius := turnRadius
		centerX := lateralOffset + turnRadius
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
	radiusX := config.OpeningWidth/2 - SpiralRadiusOffset
	if radiusX < SpiralMinRadius {
		radiusX = SpiralMinRadius
	}
	radiusZ := config.OpeningLength/2 - SpiralRadiusOffset
	if radiusZ < SpiralMinRadius {
		radiusZ = radiusX
	}

	totalAngle := 2*math.Pi + float64(stepsCount)/10*math.Pi
	anglePerStep := totalAngle / float64(stepsCount)
	treadDepth := radiusX * anglePerStep * SpiralTreadFactor
	inclination := math.Atan(rise/treadDepth) * 180 / math.Pi

	steps := make([]models.StepPosition, stepsCount)

	for i := 0; i < stepsCount; i++ {
		angle := float64(i) * anglePerStep
		x := radiusX * math.Cos(angle)
		z := radiusZ * math.Sin(angle)

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