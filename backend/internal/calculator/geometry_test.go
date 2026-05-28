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
			if winderCount != 5 {
				t.Errorf("expected 5 winder steps, got %d", winderCount)
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
		{"Spiral 2800mm, 1500 opening", 2800, 1500, 16},
		{"Spiral 2400mm, 1400 opening", 2400, 1400, 14},
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

			// Verify steps are on a circle (radius ~ openingWidth/2-100)
			if len(steps) > 0 {
				expectedRadius := tc.openingWidth/2 - 100
				for i, step := range steps {
					radius := math.Sqrt(step.Position[0]*step.Position[0] + step.Position[2]*step.Position[2])
					if math.Abs(radius-expectedRadius) > 10 {
						t.Errorf("step %d: radius (%.1f) should be close to %.0f", i, radius, expectedRadius)
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

	// Lower march should have x = stepWidth/2 (wall-aligned)
	for i := 0; i < firstWinderIndex; i++ {
		if math.Abs(steps[i].Position[0]-450) > 0.01 {
			t.Errorf("step %d in lower march: x should be 450, got %.4f", i, steps[i].Position[0])
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

	// Upper march should have constant z among themselves
	if lastWinderIndex >= 0 && lastWinderIndex < len(steps)-1 {
		upperZ := steps[lastWinderIndex+1].Position[2]
		for i := lastWinderIndex + 2; i < len(steps); i++ {
			if math.Abs(steps[i].Position[2]-upperZ) > 1 {
				t.Errorf("step %d in upper march: z should be constant (%.1f), got %.1f",
					i, upperZ, steps[i].Position[2])
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

	if winders != 5 {
		t.Errorf("expected 5 winder steps, got %d", winders)
	}
}