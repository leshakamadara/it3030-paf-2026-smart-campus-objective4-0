-- V2__Add_Cloudinary_Fields_To_Ticket_Attachments.sql

ALTER TABLE ticket_attachments ADD COLUMN cloudinary_public_id VARCHAR(500);
ALTER TABLE ticket_attachments ADD COLUMN cloudinary_url VARCHAR(1000);
ALTER TABLE ticket_attachments ADD COLUMN cloudinary_secure_url VARCHAR(1000);
ALTER TABLE ticket_attachments ADD COLUMN cloudinary_size BIGINT;
ALTER TABLE ticket_attachments ADD COLUMN cloudinary_resource_type VARCHAR(100);

-- Create index for Cloudinary public ID for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_cloudinary_public_id ON ticket_attachments(cloudinary_public_id);
