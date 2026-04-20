-- V7_2__Fix_Tickets_Table_Schema.sql

-- Drop and recreate tickets table with all required columns
DROP TABLE IF EXISTS tickets CASCADE;

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    resource_location VARCHAR(255),
    description TEXT,
    priority VARCHAR(50),
    status VARCHAR(50),
    resolution_note TEXT,
    rejection_reason TEXT,
    user_id UUID NOT NULL REFERENCES users(id),
    technician_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);