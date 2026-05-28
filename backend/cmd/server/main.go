package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/yourorg/stairs-backend/internal/api"
	"github.com/yourorg/stairs-backend/internal/config"
	"github.com/yourorg/stairs-backend/internal/storage"
	"github.com/yourorg/stairs-backend/internal/tasks"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()

	pool, err := storage.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer pool.Close()

	redisClient, err := storage.NewRedis(cfg.RedisURL)
	if err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}
	defer redisClient.Close()

	minioClient, err := storage.NewMinio(cfg.MinioEndpoint, cfg.MinioAccessKey, cfg.MinioSecretKey, cfg.MinioBucket, cfg.MinioSecure)
	if err != nil {
		log.Printf("Warning: failed to connect to minio: %v. Continuing without minio.", err)
		minioClient = nil
	}

	asynqClient := tasks.NewAsynqClient(cfg.RedisURL)
	asynqServer := tasks.NewAsynqServer(cfg.RedisURL, pool, minioClient, cfg.MinioPublicURL)
	defer asynqServer.Stop()

	deps := &api.Deps{
		Pool:   pool,
		Redis:  redisClient,
		Minio:  minioClient,
		Asynq:  asynqClient,
		Config: cfg,
	}

	if err := run(ctx, deps, cfg); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func run(ctx context.Context, deps *api.Deps, cfg *config.Config) error {
	router := chi.NewRouter()

	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	router.Mount("/", api.NewRouter(deps))

	httpServer := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("Starting server on port %s", cfg.Port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("ListenAndServe error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	log.Println("Server stopped")
	return nil
}