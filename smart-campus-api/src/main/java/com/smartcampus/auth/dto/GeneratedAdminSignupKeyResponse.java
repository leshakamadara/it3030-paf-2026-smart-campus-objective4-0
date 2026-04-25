package com.smartcampus.auth.dto;

import java.time.Instant;

public class GeneratedAdminSignupKeyResponse {

    private String signupKey;
    private Instant expiresAt;
    private Instant createdAt;
    private String createdByEmail;

    public GeneratedAdminSignupKeyResponse() {
    }

    public GeneratedAdminSignupKeyResponse(String signupKey, Instant expiresAt, Instant createdAt, String createdByEmail) {
        this.signupKey = signupKey;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.createdByEmail = createdByEmail;
    }

    public String getSignupKey() {
        return signupKey;
    }

    public void setSignupKey(String signupKey) {
        this.signupKey = signupKey;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
    }
}
