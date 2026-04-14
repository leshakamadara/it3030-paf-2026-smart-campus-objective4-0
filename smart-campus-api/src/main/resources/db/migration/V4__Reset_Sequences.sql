-- V4__Reset_Sequences.sql

-- Reset sequences to start from the next available ID after existing records
-- This fixes the duplicate key error when inserting new records

-- Get the max ID from users table and set sequence accordingly
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1);

-- Get the max ID from tickets table and set sequence accordingly
SELECT setval('tickets_id_seq', COALESCE((SELECT MAX(id) FROM tickets), 0) + 1);

-- Get the max ID from ticket_attachments table and set sequence accordingly
SELECT setval('ticket_attachments_id_seq', COALESCE((SELECT MAX(id) FROM ticket_attachments), 0) + 1);

-- Get the max ID from ticket_comments table and set sequence accordingly
SELECT setval('ticket_comments_id_seq', COALESCE((SELECT MAX(id) FROM ticket_comments), 0) + 1);
