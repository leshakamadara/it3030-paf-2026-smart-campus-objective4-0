CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(255),
    entity VARCHAR(255),
    entity_id VARCHAR(255),
    performed_by VARCHAR(255),
    performed_at TIMESTAMP,
    details TEXT
);
