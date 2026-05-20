-- +goose Up
CREATE TABLE IF NOT EXISTS coatings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_per_m2 DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- +goose Down
DROP TABLE IF EXISTS coatings;