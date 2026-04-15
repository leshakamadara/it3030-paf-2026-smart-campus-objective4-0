package com.smartcampus.booking.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurrentBookingUserService {

    private final JdbcTemplate jdbcTemplate;

    public CurrentBookingUserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UUID resolveUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String identity = authentication.getName();
        if (!StringUtils.hasText(identity)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to resolve authenticated user");
        }

        try {
            return UUID.fromString(identity);
        } catch (IllegalArgumentException ignored) {
            // fallback to email-based lookup
        }

        List<UUID> ids = jdbcTemplate.query(
                "SELECT id FROM users WHERE email = ? LIMIT 1",
                (rs, rowNum) -> (UUID) rs.getObject("id"),
                identity
        );

        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user is not mapped to users table");
        }

        return ids.get(0);
    }

    public boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> "ROLE_ADMIN".equals(role) || "ROLE_SUPER_ADMIN".equals(role));
    }
}
