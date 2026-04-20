-- V7_1__Fix_Ticket_Comments_User_Id_Type.sql
-- Fix both users and ticket_comments tables to use UUID for user IDs

-- Ensure user_role ENUM type exists
DO $$
BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- First, rename the users table to preserve existing data
ALTER TABLE users RENAME TO users_old;

-- Create the new users table with UUID id
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    avatar_url TEXT,
    google_sub VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    notification_prefs JSONB DEFAULT '{"BOOKING_APPROVED":true,"BOOKING_REJECTED":true,"BOOKING_REMINDER":true,"TICKET_UPDATED":true,"SYSTEM_ALERT":true}'::jsonb,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Copy data from old users table - only copy columns that exist
INSERT INTO users (email, role)
SELECT
    email,
    role::user_role
FROM users_old;

-- Try to copy optional columns if they exist
DO $$
BEGIN
    UPDATE users u SET full_name = (
        SELECT full_name FROM users_old WHERE users_old.email = u.email
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    UPDATE users u SET avatar_url = (
        SELECT avatar_url FROM users_old WHERE users_old.email = u.email
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    UPDATE users u SET google_sub = (
        SELECT google_sub FROM users_old WHERE users_old.email = u.email
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    UPDATE users u SET password_hash = (
        SELECT password_hash FROM users_old WHERE users_old.email = u.email
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    UPDATE users u SET last_login_at = (
        SELECT last_login_at FROM users_old WHERE users_old.email = u.email
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    UPDATE users u SET notification_prefs = (
        SELECT notification_prefs FROM users_old WHERE users_old.email = u.email
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Drop the old table
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_technician_id_fkey;
ALTER TABLE ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey;
DROP TABLE users_old;

-- Since we're in development, drop and recreate tickets and ticket_comments tables with correct UUID types
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_attachments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;

-- Recreate tickets table with UUID user_id
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

-- Recreate ticket_attachments table
CREATE TABLE ticket_attachments (
    id BIGSERIAL PRIMARY KEY,
    link_url VARCHAR(500),
    cloudinary_public_id VARCHAR(500),
    cloudinary_url VARCHAR(1000),
    cloudinary_secure_url VARCHAR(1000),
    cloudinary_size BIGINT,
    cloudinary_resource_type VARCHAR(100),
    cloudinary_version BIGINT,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Recreate ticket_comments table with UUID user_id
CREATE TABLE ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    comment TEXT,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Recreate indexes for performance
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_technician_id ON tickets(technician_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_cloudinary_public_id ON ticket_attachments(cloudinary_public_id);
CREATE INDEX idx_ticket_attachments_cloudinary_version ON ticket_attachments(cloudinary_version);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
