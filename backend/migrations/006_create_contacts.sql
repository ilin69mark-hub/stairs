-- +goose Up
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    message TEXT,
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_is_processed ON contacts(is_processed);

-- +goose Down
DROP TABLE IF EXISTS contacts;