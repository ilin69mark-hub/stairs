-- +goose Up
CREATE TABLE IF NOT EXISTS stair_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    work_price_per_step DECIMAL(10,2) NOT NULL,
    min_height INTEGER NOT NULL,
    max_height INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- +goose Down
DROP TABLE IF EXISTS stair_types;