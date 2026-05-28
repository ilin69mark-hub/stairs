package handlers

import (
	"encoding/json"
	"log"
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
	ID              string  `json:"id"`
	Slug            string  `json:"slug"`
	Name            string  `json:"name"`
	Type            string  `json:"type"`
	PricePerUnit    float64 `json:"pricePerUnit"`
	Unit            string  `json:"unit"`
	TextureURL      *string `json:"textureUrl"`
	NormalMapURL    *string `json:"normalMapUrl"`
	RoughnessMapURL *string `json:"roughnessMapUrl"`
	IsActive        bool    `json:"isActive"`
}

type Railing struct {
	ID             string  `json:"id"`
	Slug           string  `json:"slug"`
	Name           string  `json:"name"`
	PricePerMeter  float64 `json:"pricePerMeter"`
	ModelURL       *string `json:"modelUrl"`
	IsActive       bool    `json:"isActive"`
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
	if err != nil {
		log.Printf("failed to query stair_types: %v", err)
		http.Error(w, "failed to fetch catalog", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var st StairType
		if err := rows.Scan(&st.ID, &st.Slug, &st.Name, &st.WorkPricePerStep, &st.MinHeight, &st.MaxHeight, &st.ImageURL, &st.IsActive); err != nil {
			log.Printf("failed to scan stair_type: %v", err)
			continue
		}
		response.StairTypes = append(response.StairTypes, st)
	}
	if err := rows.Err(); err != nil {
		log.Printf("rows error after stair_types scan: %v", err)
	}

	rows, err = h.pool.Query(r.Context(), "SELECT id, slug, name, type, price_per_unit, unit, texture_url, normal_map_url, roughness_map_url, is_active FROM materials WHERE is_active = true")
	if err != nil {
		log.Printf("failed to query materials: %v", err)
		http.Error(w, "failed to fetch catalog", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var m Material
		if err := rows.Scan(&m.ID, &m.Slug, &m.Name, &m.Type, &m.PricePerUnit, &m.Unit, &m.TextureURL, &m.NormalMapURL, &m.RoughnessMapURL, &m.IsActive); err != nil {
			log.Printf("failed to scan material: %v", err)
			continue
		}
		response.Materials = append(response.Materials, m)
	}
	if err := rows.Err(); err != nil {
		log.Printf("rows error after materials scan: %v", err)
	}

	rows, err = h.pool.Query(r.Context(), "SELECT id, slug, name, price_per_meter, model_url, is_active FROM railings WHERE is_active = true")
	if err != nil {
		log.Printf("failed to query railings: %v", err)
		http.Error(w, "failed to fetch catalog", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var rl Railing
		if err := rows.Scan(&rl.ID, &rl.Slug, &rl.Name, &rl.PricePerMeter, &rl.ModelURL, &rl.IsActive); err != nil {
			log.Printf("failed to scan railing: %v", err)
			continue
		}
		response.Railings = append(response.Railings, rl)
	}
	if err := rows.Err(); err != nil {
		log.Printf("rows error after railings scan: %v", err)
	}

	rows, err = h.pool.Query(r.Context(), "SELECT id, slug, name, price_per_m2, is_active FROM coatings WHERE is_active = true")
	if err != nil {
		log.Printf("failed to query coatings: %v", err)
		http.Error(w, "failed to fetch catalog", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var c Coating
		if err := rows.Scan(&c.ID, &c.Slug, &c.Name, &c.PricePerM2, &c.IsActive); err != nil {
			log.Printf("failed to scan coating: %v", err)
			continue
		}
		response.Coatings = append(response.Coatings, c)
	}
	if err := rows.Err(); err != nil {
		log.Printf("rows error after coatings scan: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}