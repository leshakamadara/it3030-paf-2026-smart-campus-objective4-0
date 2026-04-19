package com.smartcampus.audit.entity;

import java.util.Locale;

public enum AuditAction {
    ROLE_UPDATE,
    STATUS_UPDATE,
    NOTIFICATION_PREFS_UPDATE,
    SYSTEM_ALERT,
    OTHER;

    public static AuditAction from(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }

        try {
            return AuditAction.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return OTHER;
        }
    }
}
