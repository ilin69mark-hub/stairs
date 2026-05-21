package config

import "os"

type Config struct {
	Port            string
	DatabaseURL     string
	RedisURL        string
	MinioEndpoint   string
	MinioAccessKey  string
	MinioSecretKey  string
	CorsOrigin      string
	StrapiURL       string
}

func Load() *Config {
	return &Config{
		Port:            getEnv("PORT", "8080"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://stairs:secret@localhost:5432/stairs?sslmode=disable"),
		RedisURL:        getEnv("REDIS_URL", "localhost:6379"),
		MinioEndpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey:  getEnv("MINIO_ACCESS_KEY", ""),
		MinioSecretKey:  getEnv("MINIO_SECRET_KEY", ""),
		CorsOrigin:      getEnv("CORS_ORIGIN", "http://localhost:3000"),
		StrapiURL:       getEnv("STRAPI_URL", "strapi:1337"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}