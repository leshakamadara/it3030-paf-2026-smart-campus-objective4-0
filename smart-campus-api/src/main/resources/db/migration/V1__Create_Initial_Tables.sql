-- V1__Create_Initial_Tables.sql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    priority VARCHAR(50),
    status VARCHAR(50),
    user_id BIGINT NOT NULL,
    technician_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (

    id BIGSERIAL PRIMARY KEY,
    link_url VARCHAR(500),
    ticket_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE

);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (

    id BIGSERIAL PRIMARY KEY,
    comment TEXT,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)

);

-- Create indexes for better query performance
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_technician_id ON tickets(technician_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
