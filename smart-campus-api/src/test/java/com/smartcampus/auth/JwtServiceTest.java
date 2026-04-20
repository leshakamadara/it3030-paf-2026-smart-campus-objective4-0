package com.smartcampus.auth;

import com.smartcampus.auth.service.JwtService;
import com.smartcampus.common.entity.Role;
import com.smartcampus.config.JwtConfig;
import com.smartcampus.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
class JwtServiceTest {

    private static final String TEST_SECRET = "75uQL6kibsz46vCzzclELrEx4lu0/UapN3RVXs8LhiiBwizyYhXcfJYZWAOayiEOFEJD41sy3tMlgUAJC6iN2Q==";

    @Test
    void shouldGenerateAndValidateToken() {
        JwtConfig jwtConfig = new JwtConfig();
        jwtConfig.setJwtSecret(TEST_SECRET);
        jwtConfig.setJwtExpirationInMs(60_000L);
        JwtService jwtService = new JwtService(jwtConfig);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@smartcampus.com");
        user.setRole(Role.ADMIN);

        String token = jwtService.generateToken(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "user@smartcampus.com",
                "",
                Collections.emptyList()
        );

        assertTrue(jwtService.validateToken(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertEquals("user@smartcampus.com", jwtService.extractUsername(token));
    }

    @Test
    void shouldExtractRoleClaim() {
        JwtConfig jwtConfig = new JwtConfig();
        jwtConfig.setJwtSecret(TEST_SECRET);
        jwtConfig.setJwtExpirationInMs(60_000L);
        JwtService jwtService = new JwtService(jwtConfig);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("technician@smartcampus.com");
        user.setRole(Role.TECHNICIAN);

        String token = jwtService.generateToken(user);

        assertEquals(Role.TECHNICIAN, jwtService.extractRole(token));
    }
}
