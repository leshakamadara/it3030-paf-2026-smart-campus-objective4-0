-- CREATE EXTENSION IF NOT EXISTS pgcrypto; -- Not needed for H2

-- H2 doesn't support custom ENUM types like PostgreSQL, using VARCHAR instead
-- CREATE TYPE user_role AS ENUM ('USER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    avatar_url TEXT,
    google_sub VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP,
    notification_prefs VARCHAR(1000) NOT NULL DEFAULT '{"BOOKING_APPROVED":true,"BOOKING_REJECTED":true,"BOOKING_REMINDER":true,"TICKET_UPDATED":true,"SYSTEM_ALERT":true}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Triggers not supported in this simplified version
