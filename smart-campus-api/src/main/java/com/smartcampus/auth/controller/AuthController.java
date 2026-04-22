package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.service.AuthenticationService;
import com.smartcampus.auth.service.JwtService;
import com.smartcampus.user.UserService;
import com.smartcampus.user.dto.UserResponse;
import com.smartcampus.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and session management endpoints")
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
    @Operation(summary = "Get current user", description = "Returns the authenticated user profile")
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
    @Operation(summary = "Refresh JWT", description = "Issues a fresh JWT for the authenticated user")
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
    @Operation(summary = "Logout", description = "Client-driven logout endpoint for stateless JWT sessions")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dummy-login")
    @Operation(summary = "Dummy login", description = "Development-only endpoint to create/login a user and receive a JWT")
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

    @PostMapping("/register")
    @Operation(summary = "Campus register", description = "Creates a campus-account user with email and password")
    public ResponseEntity<?> register(@RequestBody CampusRegisterRequest request) {
        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        User user = authenticationService.registerCampusUser(request.getEmail(), request.getFullName(), request.getPassword());
        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.from(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("Authorization", "Bearer " + token)
                .body(new AuthResponse(token, userResponse));
    }

    @PostMapping("/register-admin")
    @Operation(summary = "Admin register", description = "Creates an ADMIN account using a super-admin generated signup key")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegisterRequest request) {
        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        User user = authenticationService.registerAdminUser(
                request.getEmail(),
                request.getFullName(),
                request.getPassword(),
                request.getAdminSignupKey());
        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.from(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("Authorization", "Bearer " + token)
                .body(new AuthResponse(token, userResponse));
    }

    @PostMapping("/login")
    @Operation(summary = "Campus login", description = "Authenticates campus-account user with email and password")
    public ResponseEntity<?> login(@RequestBody CampusLoginRequest request) {
        User user = authenticationService.loginCampusUser(request.getEmail(), request.getPassword());
        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.from(user);
        return ResponseEntity.ok().header("Authorization", "Bearer " + token).body(new AuthResponse(token, userResponse));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(exception.getMessage());
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

    public static class CampusLoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class CampusRegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String confirmPassword;

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getConfirmPassword() {
            return confirmPassword;
        }

        public void setConfirmPassword(String confirmPassword) {
            this.confirmPassword = confirmPassword;
        }
    }

    public static class AdminRegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String confirmPassword;
        private String adminSignupKey;

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getConfirmPassword() {
            return confirmPassword;
        }

        public void setConfirmPassword(String confirmPassword) {
            this.confirmPassword = confirmPassword;
        }

        public String getAdminSignupKey() {
            return adminSignupKey;
        }

        public void setAdminSignupKey(String adminSignupKey) {
            this.adminSignupKey = adminSignupKey;
        }
    }
}
