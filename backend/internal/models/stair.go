package models

type StairConfig struct {
	Type          string  `json:"type" validate:"required"`
	FloorHeight  float64 `json:"floorHeight" validate:"required,gt=0"`
	OpeningWidth float64 `json:"openingWidth"`
	OpeningLength float64 `json:"openingLength"`
	StepWidth    float64 `json:"stepWidth" validate:"required,gt=0"`
	Material     string  `json:"material"`
	Railing      string  `json:"railing"`
	Coating      string  `json:"coating"`
}

type StepPosition struct {
	Index        int       `json:"index"`
	Position     [3]float64 `json:"position"`
	RotationY    float64   `json:"rotationY"`
	IsWinder     bool      `json:"isWinder"`
	TreadDepth   float64   `json:"treadDepth"`
	RiseHeight   float64   `json:"riseHeight"`
	Width        float64   `json:"width"`
}

type CalculationResult struct {
	Steps          []StepPosition `json:"steps"`
	TotalSteps     int            `json:"totalSteps"`
	Inclination    float64        `json:"inclination"`
	IsValid        bool           `json:"isValid"`
	MaterialCost   float64        `json:"materialCost"`
	WorkCost       float64        `json:"workCost"`
	RailingCost    float64        `json:"railingCost"`
	CoatingCost    float64        `json:"coatingCost"`
	TotalPrice     float64        `json:"totalPrice"`
}