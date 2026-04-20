-- V3__Add_Cloudinary_Version_To_Ticket_Attachments.sql

ALTER TABLE ticket_attachments
ADD COLUMN cloudinary_version BIGINT;

-- Create index for Cloudinary version for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_cloudinary_version ON ticket_attachments(cloudinary_version);