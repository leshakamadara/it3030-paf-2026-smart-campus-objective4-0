package com.smartcampus.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.smartcampus.auth.dto.GeneratedAdminSignupKeyResponse;
import com.smartcampus.auth.entity.AdminSignupKey;
import com.smartcampus.auth.repository.AdminSignupKeyRepository;

@Service
public class AdminSignupKeyService {

    private static final String KEY_PREFIX = "ADM-";
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int RANDOM_SEGMENT_LENGTH = 24;

    private final AdminSignupKeyRepository adminSignupKeyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.auth.admin-signup-key-valid-hours:24}")
    private long keyValidHours;

    public AdminSignupKeyService(AdminSignupKeyRepository adminSignupKeyRepository) {
        this.adminSignupKeyRepository = adminSignupKeyRepository;
    }

    public GeneratedAdminSignupKeyResponse generateKey(String createdByEmail) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(keyValidHours, ChronoUnit.HOURS);

        AdminSignupKey key = new AdminSignupKey();
        key.setKeyValue(generateReadableKey());
        key.setCreatedByEmail(createdByEmail);
        key.setCreatedAt(now);
        key.setExpiresAt(expiresAt);
        key.setUsed(false);

        AdminSignupKey saved = adminSignupKeyRepository.save(key);

        return new GeneratedAdminSignupKeyResponse(
                saved.getKeyValue(),
                saved.getExpiresAt(),
                saved.getCreatedAt(),
                saved.getCreatedByEmail());
    }

    public void consumeKeyOrThrow(String rawKey, String usedByEmail) {
        if (!StringUtils.hasText(rawKey)) {
            throw new IllegalArgumentException("Admin signup key is required");
        }

        String normalized = normalizeKey(rawKey);
        AdminSignupKey key = adminSignupKeyRepository.findByKeyValue(normalized)
                .orElseThrow(() -> new IllegalArgumentException("Invalid admin signup key"));

        if (key.isUsed()) {
            throw new IllegalArgumentException("Admin signup key has already been used");
        }

        if (Instant.now().isAfter(key.getExpiresAt())) {
            throw new IllegalArgumentException("Admin signup key has expired");
        }

        key.setUsed(true);
        key.setUsedAt(Instant.now());
        key.setUsedByEmail(usedByEmail);

        adminSignupKeyRepository.save(key);
    }

    private String generateReadableKey() {
        StringBuilder builder = new StringBuilder(KEY_PREFIX);

        for (int i = 0; i < RANDOM_SEGMENT_LENGTH; i++) {
            int index = secureRandom.nextInt(ALPHABET.length());
            builder.append(ALPHABET.charAt(index));
            if ((i + 1) % 4 == 0 && i < RANDOM_SEGMENT_LENGTH - 1) {
                builder.append('-');
            }
        }

        return builder.toString();
    }

    private String normalizeKey(String key) {
        return key.trim().toUpperCase();
    }
}
