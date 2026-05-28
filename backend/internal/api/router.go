package api

import (
	"net/http"
	"net/http/httputil"

	"github.com/go-chi/chi/v5"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/minio/minio-go/v7"
	"github.com/redis/go-redis/v9"

	"github.com/yourorg/stairs-backend/internal/api/handlers"
	"github.com/yourorg/stairs-backend/internal/calculator"
	"github.com/yourorg/stairs-backend/internal/config"
)

type Deps struct {
	Pool     *pgxpool.Pool
	Redis    *redis.Client
	Minio    *minio.Client
	Asynq    *asynq.Client
	Config   *config.Config
}

func NewRouter(deps *Deps) chi.Router {
	r := chi.NewRouter()

	calcService := calculator.NewCalculationService()
	calcHandler := handlers.NewCalculatorHandler(calcService)
	catalogHandler := handlers.NewCatalogHandler(deps.Pool)
	ordersHandler := handlers.NewOrdersHandler(deps.Pool, deps.Asynq)
	contactsHandler := handlers.NewContactsHandler(deps.Pool, deps.Asynq)

	corsOrigin := "*"
	if deps.Config != nil && deps.Config.CorsOrigin != "" {
		corsOrigin = deps.Config.CorsOrigin
	}

	r.Route("/api/v1", func(r chi.Router) {
		r.Use(corsMiddleware(corsOrigin))
		r.Post("/calculate", calcHandler.CalculatePrecise)
		r.Get("/catalog", catalogHandler.GetCatalog)
		r.Post("/orders", ordersHandler.CreateOrder)
		r.Post("/contacts", contactsHandler.SubmitContact)
	})

	r.Route("/api/cms", func(r chi.Router) {
		if deps.Config != nil && deps.Config.StrapiProxyToken != "" {
			r.Use(strapiAuthMiddleware(deps.Config.StrapiProxyToken))
		}
		proxy := &httputil.ReverseProxy{
			Director: func(req *http.Request) {
				req.URL.Scheme = "http"
				req.URL.Host = deps.Config.StrapiHost
			},
		}
		r.Handle("/*", proxy)
	})

	return r
}

func strapiAuthMiddleware(token string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get("X-Strapi-Token") != token {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func corsMiddleware(origin string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}