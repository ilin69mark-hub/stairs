-- +goose Up
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('wood', 'metal', 'glass')),
    price_per_unit DECIMAL(12,2) NOT NULL,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('m3', 'm2', 'unit')),
    texture_url TEXT,
    normal_map_url TEXT,
    roughness_map_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS materials;