-- +goose Up
CREATE SEQUENCE IF NOT EXISTS orders_sequence;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'completed', 'cancelled')),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    customer_address TEXT,
    comment TEXT,
    stair_config JSONB NOT NULL,
    calculated_geometry JSONB,
    material_cost DECIMAL(12,2),
    work_cost DECIMAL(12,2),
    railing_cost DECIMAL(12,2),
    coating_cost DECIMAL(12,2),
    total_price DECIMAL(12,2),
    pdf_estimate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- +goose Down
DROP TABLE IF EXISTS orders;