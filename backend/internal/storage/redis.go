package storage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewRedis(redisURL string) (*redis.Client, error) {
	addr := redisURL
	if !strings.HasPrefix(addr, "redis://") && !strings.HasPrefix(addr, "rediss://") {
		addr = "redis://" + addr
	}

	opts, err := redis.ParseURL(addr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis url: %w", err)
	}

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping redis: %w", err)
	}

	return client, nil
}