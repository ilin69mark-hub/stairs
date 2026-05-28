package config

import "os"

type Config struct {
	Port            string
	DatabaseURL     string
	RedisURL        string
	MinioEndpoint   string
	MinioAccessKey  string
	MinioSecretKey  string
	MinioSecure     bool
	MinioBucket      string
	MinioPublicURL   string
	CorsOrigin       string
	StrapiHost       string
	StrapiProxyToken string
}

func Load() *Config {
	return &Config{
		Port:            getEnv("PORT", "8080"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://stairs:secret@localhost:5432/stairs?sslmode=disable"),
		RedisURL:        getEnv("REDIS_URL", "localhost:6379"),
		MinioEndpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey:  getEnv("MINIO_ACCESS_KEY", ""),
		MinioSecretKey:  getEnv("MINIO_SECRET_KEY", ""),
		MinioSecure:     getEnv("MINIO_SECURE", "false") == "true",
		MinioBucket:     getEnv("MINIO_BUCKET", "stairs"),
		MinioPublicURL:   getEnv("MINIO_PUBLIC_URL", "http://localhost:9000"),
		CorsOrigin:       getEnv("CORS_ORIGIN", "http://localhost:3000"),
		StrapiHost:       getEnv("STRAPI_HOST", "strapi:1337"),
		StrapiProxyToken: getEnv("STRAPI_PROXY_TOKEN", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}