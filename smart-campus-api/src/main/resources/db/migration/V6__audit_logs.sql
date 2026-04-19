DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'audit_action'
    ) THEN
        CREATE TYPE audit_action AS ENUM (
            'ROLE_UPDATE',
            'STATUS_UPDATE',
            'NOTIFICATION_PREFS_UPDATE',
            'SYSTEM_ALERT',
            'OTHER'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'audit_log'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'audit_logs'
    ) THEN
        ALTER TABLE audit_log RENAME TO audit_logs;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action audit_action NOT NULL DEFAULT 'OTHER',
    entity VARCHAR(255),
    entity_id VARCHAR(255),
    performed_by VARCHAR(255),
    performed_at TIMESTAMPTZ,
    details TEXT
);

ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS entity VARCHAR(255),
    ADD COLUMN IF NOT EXISTS entity_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS performed_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS performed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS details TEXT;

DO $$
DECLARE
    action_udt_name TEXT;
BEGIN
    SELECT c.udt_name
    INTO action_udt_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'audit_logs'
      AND c.column_name = 'action';

    IF action_udt_name IS NULL THEN
        ALTER TABLE audit_logs
            ADD COLUMN action audit_action NOT NULL DEFAULT 'OTHER';
    ELSIF action_udt_name <> 'audit_action' THEN
        ALTER TABLE audit_logs
            ALTER COLUMN action TYPE audit_action
            USING CASE
                WHEN action IN ('ROLE_UPDATE', 'STATUS_UPDATE', 'NOTIFICATION_PREFS_UPDATE', 'SYSTEM_ALERT', 'OTHER')
                    THEN action::audit_action
                ELSE 'OTHER'::audit_action
            END;

        ALTER TABLE audit_logs
            ALTER COLUMN action SET DEFAULT 'OTHER';
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON audit_logs (performed_at);
