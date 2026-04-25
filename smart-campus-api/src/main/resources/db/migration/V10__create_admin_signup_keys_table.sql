CREATE TABLE IF NOT EXISTS admin_signup_keys (
    id UUID PRIMARY KEY,
    key_value VARCHAR(128) NOT NULL UNIQUE,
    created_by_email VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_by_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_signup_keys_expires_at ON admin_signup_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_signup_keys_used ON admin_signup_keys(used);
