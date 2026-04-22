package com.smartcampus.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.auth.dto.GeneratedAdminSignupKeyResponse;
import com.smartcampus.auth.service.AdminSignupKeyService;

@RestController
@RequestMapping("/api/admin/admin-signup-keys")
public class AdminSignupKeyController {

    private final AdminSignupKeyService adminSignupKeyService;

    public AdminSignupKeyController(AdminSignupKeyService adminSignupKeyService) {
        this.adminSignupKeyService = adminSignupKeyService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<GeneratedAdminSignupKeyResponse> generate(Authentication authentication) {
        GeneratedAdminSignupKeyResponse response = adminSignupKeyService.generateKey(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
