package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CatalogHandler struct {
	pool *pgxpool.Pool
}

func NewCatalogHandler(pool *pgxpool.Pool) *CatalogHandler {
	return &CatalogHandler{pool: pool}
}

type StairType struct {
	ID              string  `json:"id"`
	Slug            string  `json:"slug"`
	Name            string  `json:"name"`
	WorkPricePerStep float64 `json:"workPricePerStep"`
	MinHeight       int     `json:"minHeight"`
	MaxHeight       int     `json:"maxHeight"`
	ImageURL        *string `json:"imageUrl"`
	IsActive        bool    `json:"isActive"`
}

type Material struct {
	ID             string  `json:"id"`
	Slug           string  `json:"slug"`
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	PricePerUnit   float64 `json:"pricePerUnit"`
	Unit           string  `json:"unit"`
	TextureURL     *string `json:"textureUrl"`
	NormalMapURL   *string `json:"normalMapUrl"`
	RoughnessMapURL *string `json:"roughnessMapUrl"`
	IsActive       bool    `json:"isActive"`
}

type Railing struct {
	ID           string  `json:"id"`
	Slug         string  `json:"slug"`
	Name         string  `json:"name"`
	PricePerMeter float64 `json:"pricePerMeter"`
	ModelURL     *string `json:"modelUrl"`
	IsActive     bool    `json:"isActive"`
}

type Coating struct {
	ID         string  `json:"id"`
	Slug       string  `json:"slug"`
	Name       string  `json:"name"`
	PricePerM2 float64 `json:"pricePerM2"`
	IsActive   bool    `json:"isActive"`
}

type CatalogResponse struct {
	StairTypes []StairType `json:"stairTypes"`
	Materials  []Material  `json:"materials"`
	Railings   []Railing   `json:"railings"`
	Coatings   []Coating   `json:"coatings"`
}

func (h *CatalogHandler) GetCatalog(w http.ResponseWriter, r *http.Request) {
	response := CatalogResponse{}

	stairRows, err := h.pool.Query(r.Context(), "SELECT id, slug, name, work_price_per_step, min_height, max_height, image_url, is_active FROM stair_types WHERE is_active = true")
	if err != nil {
		http.Error(w, "failed to query stair types", http.StatusInternalServerError)
		return
	}
	defer stairRows.Close()
	for stairRows.Next() {
		var st StairType
		if err := stairRows.Scan(&st.ID, &st.Slug, &st.Name, &st.WorkPricePerStep, &st.MinHeight, &st.MaxHeight, &st.ImageURL, &st.IsActive); err != nil {
			http.Error(w, "failed to scan stair type", http.StatusInternalServerError)
			return
		}
		response.StairTypes = append(response.StairTypes, st)
	}

	matRows, err := h.pool.Query(r.Context(), "SELECT id, slug, name, type, price_per_unit, unit, texture_url, normal_map_url, roughness_map_url, is_active FROM materials WHERE is_active = true")
	if err != nil {
		http.Error(w, "failed to query materials", http.StatusInternalServerError)
		return
	}
	defer matRows.Close()
	for matRows.Next() {
		var m Material
		if err := matRows.Scan(&m.ID, &m.Slug, &m.Name, &m.Type, &m.PricePerUnit, &m.Unit, &m.TextureURL, &m.NormalMapURL, &m.RoughnessMapURL, &m.IsActive); err != nil {
			http.Error(w, "failed to scan material", http.StatusInternalServerError)
			return
		}
		response.Materials = append(response.Materials, m)
	}

	railRows, err := h.pool.Query(r.Context(), "SELECT id, slug, name, price_per_meter, model_url, is_active FROM railings WHERE is_active = true")
	if err != nil {
		http.Error(w, "failed to query railings", http.StatusInternalServerError)
		return
	}
	defer railRows.Close()
	for railRows.Next() {
		var rl Railing
		if err := railRows.Scan(&rl.ID, &rl.Slug, &rl.Name, &rl.PricePerMeter, &rl.ModelURL, &rl.IsActive); err != nil {
			http.Error(w, "failed to scan railing", http.StatusInternalServerError)
			return
		}
		response.Railings = append(response.Railings, rl)
	}

	coatRows, err := h.pool.Query(r.Context(), "SELECT id, slug, name, price_per_m2, is_active FROM coatings WHERE is_active = true")
	if err != nil {
		http.Error(w, "failed to query coatings", http.StatusInternalServerError)
		return
	}
	defer coatRows.Close()
	for coatRows.Next() {
		var c Coating
		if err := coatRows.Scan(&c.ID, &c.Slug, &c.Name, &c.PricePerM2, &c.IsActive); err != nil {
			http.Error(w, "failed to scan coating", http.StatusInternalServerError)
			return
		}
		response.Coatings = append(response.Coatings, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}