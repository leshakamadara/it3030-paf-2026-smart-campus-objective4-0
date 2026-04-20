-- V9__Fix_Ticket_Comments_User_Id_Type_Corrected.sql
-- Fix schema mismatch: Change user_id column in ticket_comments from BIGINT to UUID
-- This handles the case where the database was initialized with BIGINT user_id instead of UUID

-- First, drop dependent constraints and indexes
ALTER TABLE ticket_comments
DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey;

DROP INDEX IF EXISTS idx_ticket_comments_user_id;

-- Truncate the table to remove any incompatible data
TRUNCATE TABLE ticket_comments;

-- Drop the column and recreate it as UUID
ALTER TABLE ticket_comments
DROP COLUMN user_id;

ALTER TABLE ticket_comments
ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Recreate the foreign key constraint
ALTER TABLE ticket_comments
ADD CONSTRAINT ticket_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Recreate the index for performance
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
