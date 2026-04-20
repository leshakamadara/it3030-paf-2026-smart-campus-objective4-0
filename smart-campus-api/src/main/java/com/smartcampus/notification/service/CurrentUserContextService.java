package com.smartcampus.notification.service;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class CurrentUserContextService {

    private final JdbcTemplate jdbcTemplate;

    public CurrentUserContextService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UUID resolveCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Unauthenticated request");
        }

        String identity = authentication.getName();
        if (!StringUtils.hasText(identity)) {
            throw new AccessDeniedException("Unable to resolve authenticated user");
        }

        try {
            return UUID.fromString(identity);
        } catch (IllegalArgumentException ignored) {
            // Fall through and resolve by email.
        }

        try {
            List<UUID> ids = jdbcTemplate.query(
                    "select id from users where email = ? limit 1",
                    (rs, rowNum) -> (UUID) rs.getObject("id"),
                    identity
            );

            if (ids.isEmpty()) {
                throw new AccessDeniedException("Authenticated user is not linked to a local user record");
            }

            return ids.get(0);
        } catch (DataAccessException ex) {
            throw new AccessDeniedException("Failed to resolve current user from persistence", ex);
        }
    }
}
