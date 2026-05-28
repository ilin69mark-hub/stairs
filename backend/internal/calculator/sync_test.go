package calculator

import (
	"math"
	"testing"

	"github.com/yourorg/stairs-backend/internal/models"
)

// Verifies TypeScript and Go geometry engines produce identical results
// for the reference input: floorHeight=2800, stepWidth=900, openingWidth=900/1500

func assertInDelta(t *testing.T, name string, got, expected, delta float64) {
	t.Helper()
	if math.Abs(got-expected) > delta {
		t.Errorf("%s: got %.2f, expected %.2f (delta %.2f)", name, got, expected, delta)
	}
}

func assertStepInDelta(t *testing.T, stepIndex int, coord string, got, expected, delta float64) {
	t.Helper()
	if math.Abs(got-expected) > delta {
		t.Errorf("step[%d].%s: got %.2f, expected %.2f", stepIndex, coord, got, expected)
	}
}

func TestStraightSyncWithTS(t *testing.T) {
	steps, err := CalcStraight(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcStraight error: %v", err)
	}

	// Total steps
	if len(steps) != 16 {
		t.Errorf("expected 16 steps, got %d", len(steps))
	}

	// First step: x=0, y=rise, z=0
	rise := 2800.0 / 16 // 175
	if len(steps) > 0 {
		assertStepInDelta(t, 0, "x", steps[0].Position[0], 0, 1)
		assertStepInDelta(t, 0, "y", steps[0].Position[1], rise, 0.1)
		assertStepInDelta(t, 0, "z", steps[0].Position[2], 0, 1)
		assertStepInDelta(t, 0, "rotationY", steps[0].RotationY, 0, 0.01)
	}

	// Last step: x=0, y=floorHeight, z=(n-1)*tread
	tread := 620 - 2*rise // 270
	if len(steps) > 0 {
		last := steps[len(steps)-1]
		assertStepInDelta(t, len(steps)-1, "x", last.Position[0], 0, 1)
		assertStepInDelta(t, len(steps)-1, "y", last.Position[1], 2800, 1)
		assertStepInDelta(t, len(steps)-1, "z", last.Position[2], float64(len(steps)-1)*tread, 1)
	}

	// All steps must have z increment = tread
	for i := 1; i < len(steps); i++ {
		dz := steps[i].Position[2] - steps[i-1].Position[2]
		assertInDelta(t, "straight z increment", dz, tread, 0.1)
	}
}

func TestLShapedSyncWithTS(t *testing.T) {
	steps, err := CalcLShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcLShaped error: %v", err)
	}

	// Total steps
	if len(steps) != 16 {
		t.Errorf("expected 16 steps, got %d, steps", len(steps))
	}

	rise := 2800.0 / 16
	tread := 620 - 2*rise

	// Count winders
	winderCount := 0
	firstWinder := -1
	for i, s := range steps {
		if s.IsWinder {
			winderCount++
			if firstWinder < 0 {
				firstWinder = i
			}
		}
	}
	if winderCount != 5 {
		t.Errorf("expected 5 winder steps, got %d", winderCount)
	}

	// Lower flight: x = stepWidth/2 = 450
	for i := 0; i < firstWinder; i++ {
		assertStepInDelta(t, i, "x", steps[i].Position[0], 450, 0.1)
		assertStepInDelta(t, i, "rotationY", steps[i].RotationY, 0, 0.01)
	}

	// Lower flight: z = (i+0.5)*tread
	for i := 0; i < firstWinder; i++ {
		expectedZ := (float64(i) + 0.5) * tread
		assertStepInDelta(t, i, "z", steps[i].Position[2], expectedZ, 1)
	}

	// Winder steps: rotationY monotonically increasing from 0 to PI/2
	for i := firstWinder; i < firstWinder+winderCount; i++ {
		if i > firstWinder {
			if steps[i].RotationY <= steps[i-1].RotationY {
				t.Errorf("winder rotationY not increasing: step[%d]=%.4f, step[%d]=%.4f",
					i-1, steps[i-1].RotationY, i, steps[i].RotationY)
			}
		}
	}
	lastWinder := firstWinder + winderCount - 1
	assertInDelta(t, "first winder rotationY", steps[firstWinder].RotationY, 0.157, 0.02)
	assertInDelta(t, "last winder rotationY", steps[lastWinder].RotationY, math.Pi/2-0.157, 0.02)

	// Upper flight: x increasing, z constant
	upperZ := steps[lastWinder+1].Position[2]
	for i := lastWinder + 2; i < len(steps); i++ {
		assertStepInDelta(t, i, "z", steps[i].Position[2], upperZ, 1)
	}

	// Upper flight z = lastWinderZ + stepWidth/2
	expectedUpperZ := steps[lastWinder].Position[2] + 900/2.0
	assertStepInDelta(t, lastWinder+1, "z", steps[lastWinder+1].Position[2], expectedUpperZ, 1)

	// Upper flight rotationY = PI/2
	for i := lastWinder + 1; i < len(steps); i++ {
		assertStepInDelta(t, i, "rotationY", steps[i].RotationY, math.Pi/2, 0.01)
	}

	// Last step y = floorHeight
	last := steps[len(steps)-1]
	assertStepInDelta(t, len(steps)-1, "y", last.Position[1], 2800, 1)
}

func TestUShapedSyncWithTS(t *testing.T) {
	steps, err := CalcUShaped(models.StairConfig{
		FloorHeight: 2800,
		StepWidth:   900,
	})
	if err != nil {
		t.Fatalf("CalcUShaped error: %v", err)
	}

	if len(steps) != 16 {
		t.Errorf("expected 16 steps, got %d", len(steps))
	}

	// Count winders (should be 6: 3 per turn)
	winderCount := 0
	winderSegments := 0
	firstWinder := -1
	var segmentWinderCounts []int
	for i, s := range steps {
		if s.IsWinder {
			winderCount++
			if firstWinder < 0 {
				firstWinder = i
			}
		} else if firstWinder >= 0 && winderSegments == 0 {
			winderSegments++
			segmentWinderCounts = append(segmentWinderCounts, winderCount)
			winderCount = 0
		}
	}
	if winderCount > 0 {
		segmentWinderCounts = append(segmentWinderCounts, winderCount)
	}

	totalWinders := 0
	for _, c := range segmentWinderCounts {
		totalWinders += c
	}
	if totalWinders != 6 {
		t.Errorf("expected 6 total winder steps, got %d", totalWinders)
	}
	if len(segmentWinderCounts) != 2 {
		t.Errorf("expected 2 winder segments, got %d", len(segmentWinderCounts))
	}
	for i, c := range segmentWinderCounts {
		if c != 3 {
			t.Errorf("winder segment %d: expected 3 steps, got %d", i, c)
		}
	}

	// Lower flight: x=0, z = (i+0.5)*tread
	rise := 2800.0 / 16
	tread := 620 - 2*rise

	for i := 0; i < firstWinder; i++ {
		assertStepInDelta(t, i, "x", steps[i].Position[0], 0, 0.1)
		expectedZ := (float64(i) + 0.5) * tread
		assertStepInDelta(t, i, "z", steps[i].Position[2], expectedZ, 1)
	}

	// First winder: at angle=PI/(2*winderPerTurn), z = lowerEndZ + (1-cos(angle))*radius
	lowerEndZ := float64(firstWinder) * tread
	firstAngle := math.Pi / (2 * float64(WinderStepsU))
	radius := 900.0 / 2 // stepWidth / 2
	firstWinderZ := lowerEndZ + (1-math.Cos(firstAngle))*radius
	assertStepInDelta(t, firstWinder, "z", steps[firstWinder].Position[2], firstWinderZ, 1)

	// Middle flight: x=0, rotationY=PI, z decreasing
	middleStart := firstWinder + 3
	for i := middleStart; i < middleStart+3; i++ {
		assertStepInDelta(t, i, "x", steps[i].Position[0], 0, 0.1)
		assertStepInDelta(t, i, "rotationY", steps[i].RotationY, math.Pi, 0.01)
	}

	// Upper flight: x=0, rotationY=0, z increasing
	upperStart := middleStart + 3 + 3
	for i := upperStart; i < len(steps); i++ {
		assertStepInDelta(t, i, "x", steps[i].Position[0], 0, 0.1)
		assertStepInDelta(t, i, "rotationY", steps[i].RotationY, 0, 0.01)
	}

	// Last step y = floorHeight
	last := steps[len(steps)-1]
	assertStepInDelta(t, len(steps)-1, "y", last.Position[1], 2800, 1)
}

func TestSpiralSyncWithTS(t *testing.T) {
	steps, err := CalcSpiral(models.StairConfig{
		FloorHeight:  2800,
		OpeningWidth: 1500,
		StepWidth:    900,
	})
	if err != nil {
		t.Fatalf("CalcSpiral error: %v", err)
	}

	if len(steps) != 16 {
		t.Errorf("expected 16 steps, got %d", len(steps))
	}

	// All steps must be winder
	for i, s := range steps {
		if !s.IsWinder {
			t.Errorf("step %d should be winder", i)
		}
	}

	// Valid radius (no negative)
	for i, s := range steps {
		r := math.Sqrt(s.Position[0]*s.Position[0] + s.Position[2]*s.Position[2])
		if r < 640 || r > 660 {
			t.Errorf("step %d: radius %.2f should be ~650", i, r)
		}
	}

	// Tread depth should be positive
	for i, s := range steps {
		if s.TreadDepth <= 0 {
			t.Errorf("step %d: treadDepth %.2f should be positive", i, s.TreadDepth)
		}
	}

	// Y should grow uniformly
	rise := 2800.0 / 16
	for i, s := range steps {
		expectedY := float64(i+1) * rise
		assertStepInDelta(t, i, "y", s.Position[1], expectedY, 0.1)
	}

	// rotationY = angle + PI/2
	totalAngle := 2*math.Pi + float64(len(steps))/10*math.Pi
	anglePerStep := totalAngle / float64(len(steps))
	for i, s := range steps {
		angle := float64(i) * anglePerStep
		expectedRY := angle + math.Pi/2
		assertStepInDelta(t, i, "rotationY", s.RotationY, expectedRY, 0.01)
	}

	// Last step y = floorHeight
	last := steps[len(steps)-1]
	assertStepInDelta(t, len(steps)-1, "y", last.Position[1], 2800, 1)
}

func TestRiseTreadBounds(t *testing.T) {
	types := []struct {
		name   string
		fn     func(models.StairConfig) ([]models.StepPosition, error)
		config models.StairConfig
	}{
		{"straight", CalcStraight, models.StairConfig{FloorHeight: 2800, StepWidth: 900}},
		{"l-shaped", CalcLShaped, models.StairConfig{FloorHeight: 2800, StepWidth: 900}},
		{"u-shaped", CalcUShaped, models.StairConfig{FloorHeight: 2800, StepWidth: 900}},
		{"spiral", CalcSpiral, models.StairConfig{FloorHeight: 2800, OpeningWidth: 1500, StepWidth: 900}},
	}

	for _, tc := range types {
		t.Run(tc.name, func(t *testing.T) {
			steps, err := tc.fn(tc.config)
			if err != nil {
				t.Fatalf("error: %v", err)
			}

			if len(steps) < 3 {
				t.Errorf("steps count %d < 3", len(steps))
			}

			for i, s := range steps {
				if s.RiseHeight < MinRise || s.RiseHeight > MaxRise {
					t.Errorf("step %d: riseHeight %.2f out of [%.0f, %.0f]",
						i, s.RiseHeight, MinRise, MaxRise)
				}
				if s.TreadDepth > 0 && (s.TreadDepth < MinTread || s.TreadDepth > MaxTread) {
					if tc.name != "spiral" {
						t.Errorf("step %d: treadDepth %.2f out of [%.0f, %.0f]",
							i, s.TreadDepth, MinTread, MaxTread)
					}
				}
				if s.Index != i {
					t.Errorf("step %d: index should be %d, got %d", i, i, s.Index)
				}
			}
		})
	}
}
