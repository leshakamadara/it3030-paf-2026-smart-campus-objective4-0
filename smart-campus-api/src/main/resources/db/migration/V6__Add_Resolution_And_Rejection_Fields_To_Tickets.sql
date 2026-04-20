-- V6__Add_Resolution_And_Rejection_Fields_To_Tickets.sql

-- Add resolution_note and rejection_reason columns to tickets table
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS resolution_note TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;