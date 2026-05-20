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

	rows, err := h.pool.Query(r.Context(), "SELECT id, slug, name, work_price_per_step, min_height, max_height, image_url, is_active FROM stair_types WHERE is_active = true")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var st StairType
			rows.Scan(&st.ID, &st.Slug, &st.Name, &st.WorkPricePerStep, &st.MinHeight, &st.MaxHeight, &st.ImageURL, &st.IsActive)
			response.StairTypes = append(response.StairTypes, st)
		}
	}

	rows, err = h.pool.Query(r.Context(), "SELECT id, slug, name, type, price_per_unit, unit, texture_url, normal_map_url, roughness_map_url, is_active FROM materials WHERE is_active = true")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var m Material
			rows.Scan(&m.ID, &m.Slug, &m.Name, &m.Type, &m.PricePerUnit, &m.Unit, &m.TextureURL, &m.NormalMapURL, &m.RoughnessMapURL, &m.IsActive)
			response.Materials = append(response.Materials, m)
		}
	}

	rows, err = h.pool.Query(r.Context(), "SELECT id, slug, name, price_per_meter, model_url, is_active FROM railings WHERE is_active = true")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var r Railing
			rows.Scan(&r.ID, &r.Slug, &r.Name, &r.PricePerMeter, &r.ModelURL, &r.IsActive)
			response.Railings = append(response.Railings, r)
		}
	}

	rows, err = h.pool.Query(r.Context(), "SELECT id, slug, name, price_per_m2, is_active FROM coatings WHERE is_active = true")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var c Coating
			rows.Scan(&c.ID, &c.Slug, &c.Name, &c.PricePerM2, &c.IsActive)
			response.Coatings = append(response.Coatings, c)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}