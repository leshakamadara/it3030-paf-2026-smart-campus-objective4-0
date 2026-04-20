-- V5__Add_Updated_At_To_Ticket_Comments.sql

-- Add updated_at column to ticket_comments table
ALTER TABLE ticket_comments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;