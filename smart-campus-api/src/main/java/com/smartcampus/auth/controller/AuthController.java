package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.service.AuthenticationService;
import com.smartcampus.auth.service.JwtService;
import com.smartcampus.user.UserService;
import com.smartcampus.user.dto.UserResponse;
import com.smartcampus.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserService userService;

    @Value("${app.auth.allow-dummy-login:false}")
    private boolean allowDummyLogin;

    public AuthController(AuthenticationService authenticationService, JwtService jwtService, UserService userService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        UserResponse user = userService.getMyProfile(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        return ResponseEntity.ok(new AuthResponse(null, user));
    }

    @GetMapping("/refresh")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> refresh(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        User user = userService.getUserByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.from(user);
        return ResponseEntity.ok().header("Authorization", "Bearer " + token).body(new AuthResponse(token, userResponse));
    }

    @PostMapping("/logout")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dummy-login")
    public ResponseEntity<?> dummyLogin(@RequestBody DummyLoginRequest request) {
        if (!allowDummyLogin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Dummy login is disabled");
        }

        String email = request.getEmail();
        String fullName = request.getFullName();

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        User user = authenticationService.processDevelopmentLogin(email, fullName);
        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.from(user);
        return ResponseEntity.ok().header("Authorization", "Bearer " + token).body(new AuthResponse(token, userResponse));
    }

    public static class DummyLoginRequest {
        private String email;
        private String fullName;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }
}
