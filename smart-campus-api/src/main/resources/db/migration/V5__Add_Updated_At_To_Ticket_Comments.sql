-- V5__Add_Updated_At_To_Ticket_Comments.sql

-- Add updated_at column to ticket_comments table (IF NOT EXISTS for idempotency)
ALTER TABLE ticket_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;