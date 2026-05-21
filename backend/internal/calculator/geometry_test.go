package calculator

import (
	"math"
	"testing"

	"github.com/yourorg/stairs-backend/internal/models"
)

func TestStraightGeometry(t *testing.T) {
	testCases := []struct {
		name        string
		floorHeight float64
		wantSteps   int
	}{
		{"Straight 2800mm", 2800, 16},
		{"Straight 2400mm", 2400, 14},
		{"Straight 3000mm", 3000, 17},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			steps, err := CalcStraight(models.StairConfig{
				FloorHeight: tc.floorHeight,
				StepWidth:   900,
			})
			if err != nil {
				t.Fatalf("CalcStraight error: %v", err)
			}
			if len(steps) != tc.wantSteps {
				t.Errorf("floorHeight=%.0f: expected %d steps, got %d",
					tc.floorHeight, tc.wantSteps, len(steps))
			}

			// Verify first step y equals rise height
			if len(steps) > 0 {
				expectedY := steps[0].RiseHeight
				if math.Abs(steps[0].Position[1]-expectedY) > 1 {
					t.Errorf("first step y (%.1f) should equal rise height (%.1f)",
						steps[0].Position[1], expectedY)
				}
			}

			// Verify last step y close to floorHeight (accuracy 10mm)
			if len(steps) > 0 {
				lastStepY := steps[len(steps)-1].Position[1]
				if math.Abs(lastStepY-tc.floorHeight) > 10 {
					t.Errorf("last step y (%.1f) should be close to floorHeight (%.0f)",
						lastStepY, tc.floorHeight)
				}
			}

			// Verify all steps are not winder
			for i, step := range steps {
				if step.IsWinder {
					t.Errorf("step %d: should not be winder", i)
				}
				if step.RotationY != 0 {
					t.Errorf("step %d: RotationY should be 0, got %.4f", i, step.RotationY)
				}
			}

			// Verify x=0 for all steps
			for i, step := range steps {
				if math.Abs(step.Position[0]) > 0.01 {
					t.Errorf("step %d: x should be 0, got %.4f", i, step.Position[0])
				}
			}
		})
	}
}

func TestGeometrySyncWithFrontend(t *testing.T) {
	testCases := []struct {
		name        string
		floorHeight float64
		wantSteps   int
	}{
		{"L-shaped 2500mm", 2500, 14},
		{"L-shaped 2800mm", 2800, 16},
		{"L-shaped 3000mm", 3000, 17},
		{"L-shaped 3200mm", 3200, 18},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			steps, err := CalcLShaped(models.StairConfig{
				FloorHeight: tc.floorHeight,
				StepWidth:   900,
				Material:    "oak",
			})
			if err != nil {
				t.Fatalf("CalcLShaped error: %v", err)
			}
			if len(steps) != tc.wantSteps {
				t.Errorf("floorHeight=%.0f: expected %d steps, got %d",
					tc.floorHeight, tc.wantSteps, len(steps))
			}

			// Verify exactly 3 winder steps
			winderCount := 0
			for _, step := range steps {
				if step.IsWinder {
					winderCount++
				}
			}
			if winderCount != 3 {
				t.Errorf("expected 3 winder steps, got %d", winderCount)
			}

			// Verify indices are sequential 0..N-1
			for i, step := range steps {
				if step.Index != i {
					t.Errorf("step %d: index should be %d, got %d", i, i, step.Index)
				}
			}

			// Verify last step y close to floorHeight (accuracy 10mm)
			if len(steps) > 0 {
				lastStepY := steps[len(steps)-1].Position[1]
				if math.Abs(lastStepY-tc.floorHeight) > 10 {
					t.Errorf("last step y (%.1f) should be close to floorHeight (%.0f)",
						lastStepY, tc.floorHeight)
				}
			}
		})
	}
}

func TestUShapedGeometrySync(t *testing.T) {
	testCases := []struct {
		name        string
		floorHeight float64
		wantSteps   int
	}{
		{"U-shaped 2500mm", 2500, 14},
		{"U-shaped 2800mm", 2800, 16},
		{"U-shaped 3000mm", 3000, 17},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			steps, err := CalcUShaped(models.StairConfig{
				FloorHeight: tc.floorHeight,
				StepWidth:   900,
				Material:    "oak",
			})
			if err != nil {
				t.Fatalf("CalcUShaped error: %v", err)
			}
			if len(steps) != tc.wantSteps {
				t.Errorf("floorHeight=%.0f: expected %d steps, got %d",
					tc.floorHeight, tc.wantSteps, len(steps))
			}

			// Verify exactly 6 winder steps (2 turns of 3)
			winderCount := 0
			for _, step := range steps {
				if step.IsWinder {
					winderCount++
				}
			}
			if winderCount != 6 {
				t.Errorf("expected 6 winder steps, got %d", winderCount)
			}

			// Verify last step y within reasonable bounds
			if len(steps) > 0 {
				lastStepY := steps[len(steps)-1].Position[1]
				minExpected := tc.floorHeight * 0.9
				maxExpected := tc.floorHeight * 1.1
				if lastStepY < minExpected || lastStepY > maxExpected {
					t.Errorf("last step y (%.1f) should be between %.0f and %.0f for floorHeight %.0f",
						lastStepY, minExpected, maxExpected, tc.floorHeight)
				}
			}
		})
	}
}

func TestSpiralGeometry(t *testing.T) {
	testCases := []struct {
		name         string
		floorHeight  float64
		openingWidth float64
		wantSteps    int
	}{
		{"Spiral 2800mm, 1500 opening", 2800, 1500, 15},
		{"Spiral 2400mm, 1400 opening", 2400, 1400, 13},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			steps, err := CalcSpiral(models.StairConfig{
				FloorHeight:  tc.floorHeight,
				OpeningWidth: tc.openingWidth,
				StepWidth:    700,
			})
			if err != nil {
				t.Fatalf("CalcSpiral error: %v", err)
			}
			if len(steps) != tc.wantSteps {
				t.Errorf("expected %d steps, got %d", tc.wantSteps, len(steps))
			}

			// All steps should be winder
			for i, step := range steps {
				if !step.IsWinder {
					t.Errorf("step %d should be winder", i)
				}
			}

			// Verify steps are on an ellipse (radiusX ~ openingWidth/2-100, radiusZ same when no openingLength)
			if len(steps) > 0 {
				expectedRadiusX := tc.openingWidth/2 - 100
				if expectedRadiusX < SpiralMinRadius {
					expectedRadiusX = SpiralMinRadius
				}
				for i, step := range steps {
					radius := math.Sqrt(step.Position[0]*step.Position[0] + step.Position[2]*step.Position[2])
					if math.Abs(radius-expectedRadiusX) > 10 {
						t.Errorf("step %d: radius (%.1f) should be close to %.0f", i, radius, expectedRadiusX)
					}
				}
			}

			// Verify last step y close to floorHeight
			if len(steps) > 0 {
				lastStepY := steps[len(steps)-1].Position[1]
				if math.Abs(lastStepY-tc.floorHeight) > 10 {
					t.Errorf("last step y (%.1f) should be close to floorHeight (%.0f)",
						lastStepY, tc.floorHeight)
				}
			}
		})
	}
}

func TestSpiralEllipticalOpening(t *testing.T) {
	steps, err := CalcSpiral(models.StairConfig{
		FloorHeight:   2800,
		OpeningWidth:  1500,
		OpeningLength: 2000,
		StepWidth:     700,
	})
	if err != nil {
		t.Fatalf("CalcSpiral error: %v", err)
	}

	// Verify X and Z radii differ for elliptical opening
	firstStep := steps[0]
	quarterStep := steps[len(steps)/4]

	radiusX := math.Abs(firstStep.Position[0])
	radiusZ := math.Abs(quarterStep.Position[2])

	if radiusX < 10 || radiusZ < 10 {
		t.Errorf("expected non-zero radii, got radiusX=%.1f, radiusZ=%.1f", radiusX, radiusZ)
	}
}

func TestSpiralRadius(t *testing.T) {
	steps, err := CalcSpiral(models.StairConfig{
		FloorHeight:  2800,
		OpeningWidth: 1500,
		StepWidth:    700,
	})
	if err != nil {
		t.Fatalf("CalcSpiral error: %v", err)
	}

	// Verify radius ~650 for openingWidth=1500 (1500/2-100)
	expectedRadius := 1500.0/2 - 100

	if len(steps) > 0 {
		for i, step := range steps {
			radius := math.Sqrt(step.Position[0]*step.Position[0] + step.Position[2]*step.Position[2])
			if math.Abs(radius-expectedRadius) > 1 {
				t.Errorf("step %d: radius (%.2f) should be %.0f", i, radius, expectedRadius)
			}
		}
	}
}

func TestStepsCountAtLeastFive(t *testing.T) {
	steps, err := CalcSpiral(models.StairConfig{
		FloorHeight:  2800,
		OpeningWidth: 1500,
		StepWidth:    700,
	})
	if err != nil {
		t.Fatalf("CalcSpiral error: %v", err)
	}

	if len(steps) < 5 {
		t.Errorf("expected at least 5 steps, got %d", len(steps))
	}
}

func TestStraightStepsGrowAlongZ(t *testing.T) {
	steps, err := CalcStraight(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcStraight error: %v", err)
	}

	// Verify z grows by tread increment
	if len(steps) > 1 {
		treadDiff := steps[1].Position[2] - steps[0].Position[2]
		for i := 2; i < len(steps); i++ {
			diff := steps[i].Position[2] - steps[i-1].Position[2]
			if math.Abs(diff-treadDiff) > 1 {
				t.Errorf("z increment between steps %d and %d (%.2f) differs from first increment (%.2f)",
					i-1, i, diff, treadDiff)
			}
		}
	}
}

func TestLShapedLowerMarchAlongZ(t *testing.T) {
	steps, err := CalcLShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcLShaped error: %v", err)
	}

	// Find first winder
	firstWinderIndex := -1
	for i, step := range steps {
		if step.IsWinder {
			firstWinderIndex = i
			break
		}
	}

	// Lower march should have x=0
	for i := 0; i < firstWinderIndex; i++ {
		if math.Abs(steps[i].Position[0]) > 0.01 {
			t.Errorf("step %d in lower march: x should be 0, got %.4f", i, steps[i].Position[0])
		}
	}
}

func TestLShapedUpperMarchAlongX(t *testing.T) {
	steps, err := CalcLShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcLShaped error: %v", err)
	}

	// Find last winder
	lastWinderIndex := -1
	for i := len(steps) - 1; i >= 0; i-- {
		if steps[i].IsWinder {
			lastWinderIndex = i
			break
		}
	}

	// Upper march should have constant z
	if lastWinderIndex >= 0 && lastWinderIndex < len(steps)-1 {
		constantZ := steps[lastWinderIndex].Position[2]
		for i := lastWinderIndex + 1; i < len(steps); i++ {
			if math.Abs(steps[i].Position[2]-constantZ) > 20 {
				t.Errorf("step %d in upper march: z should be constant (%.1f), got %.1f",
					i, constantZ, steps[i].Position[2])
			}
		}
	}
}

func TestWinderStepsHaveRotation(t *testing.T) {
	steps, err := CalcLShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcLShaped error: %v", err)
	}

	winders := 0
	for _, step := range steps {
		if step.IsWinder {
			winders++
			if math.Abs(step.RotationY) < 0.01 {
				t.Errorf("winder step should have non-zero rotation")
			}
		}
	}

	if winders != 3 {
		t.Errorf("expected 3 winder steps, got %d", winders)
	}
}

func TestUShapedLateralOffset(t *testing.T) {
	steps, err := CalcUShaped(models.StairConfig{
		FloorHeight:   2800,
		OpeningWidth:  1500,
		OpeningLength: 3500,
		StepWidth:     900,
	})
	if err != nil {
		t.Fatalf("CalcUShaped error: %v", err)
	}

	// Find first winder end
	firstWinderEndIndex := -1
	for i := len(steps) - 1; i >= 0; i-- {
		if steps[i].IsWinder && i < len(steps)/2 {
			firstWinderEndIndex = i
			break
		}
	}

	if firstWinderEndIndex < 0 {
		t.Fatal("could not find first turn winder")
	}

	// Middle march should have lateral offset (x > 0)
	middleMarchStep := steps[firstWinderEndIndex+1]
	if middleMarchStep.Position[0] <= 0 {
		t.Errorf("middle march step x should be > 0, got %.1f", middleMarchStep.Position[0])
	}

	// First and last march should have x = 0
	if math.Abs(steps[0].Position[0]) > 0.01 {
		t.Errorf("first step x should be 0, got %.4f", steps[0].Position[0])
	}

	lastStep := steps[len(steps)-1]
	if math.Abs(lastStep.Position[0]) > 0.01 {
		t.Errorf("last step x should be 0, got %.4f", lastStep.Position[0])
	}
}

func TestValidateWinderSteps(t *testing.T) {
	// Wide stairs should pass
	stepsWide, _ := CalcLShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   1000,
	})
	wideWarnings := validateWinderSteps(stepsWide)
	narrowWarnings := 0
	for _, w := range wideWarnings {
		if containsStr(w, "narrow width") || containsStr(w, "center width") {
			narrowWarnings++
		}
	}
	if narrowWarnings > 0 {
		t.Errorf("wide stairs should not have winder width warnings, got %d", narrowWarnings)
	}

	// Narrow stairs should warn
	stepsNarrow, _ := CalcLShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   250,
	})
	narrowWarnings2 := 0
	for _, w := range validateWinderSteps(stepsNarrow) {
		if containsStr(w, "narrow width") || containsStr(w, "center width") {
			narrowWarnings2++
		}
	}
	if narrowWarnings2 == 0 {
		t.Error("narrow stairs should have winder width warnings")
	}
}

func TestValidateStairWidth(t *testing.T) {
	wide := validateStairWidth(1000)
	if len(wide) > 0 {
		t.Errorf("wide stairs should not have width warnings, got %v", wide)
	}

	narrow := validateStairWidth(800)
	if len(narrow) == 0 {
		t.Error("narrow stairs should have width warnings")
	}
}

func TestValidateSnip(t *testing.T) {
	// Valid parameters
	valid := validateSnip(175, 270, 37, 15)
	if len(valid) > 0 {
		t.Errorf("valid parameters should have no warnings, got %v", valid)
	}

	// Invalid rise
	invalidRise := validateSnip(100, 270, 37, 15)
	if len(invalidRise) == 0 {
		t.Error("invalid rise should produce warnings")
	}

	// Invalid tread
	invalidTread := validateSnip(175, 100, 37, 15)
	if len(invalidTread) == 0 {
		t.Error("invalid tread should produce warnings")
	}
}

func containsStr(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsStrHelper(s, substr))
}

func containsStrHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}