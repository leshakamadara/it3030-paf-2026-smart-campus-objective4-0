package com.smartcampus.user.controller;

import com.smartcampus.user.UserService;
import com.smartcampus.user.dto.UpdateNotificationPrefsRequest;
import com.smartcampus.user.dto.UpdateRoleRequest;
import com.smartcampus.user.dto.UpdateStatusRequest;
import com.smartcampus.user.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        return userService.getMyProfile(authentication.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<UserResponse>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable UUID id, @RequestBody UpdateRoleRequest request) {
        if (request == null || request.getRole() == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }

        boolean updated = userService.updateUserRole(id, request.getRole());
        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable UUID id) {
        boolean updated = userService.deactivateUser(id);
        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable UUID id, @RequestBody UpdateStatusRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body("Status payload is required");
        }

        boolean updated = userService.updateUserStatus(id, request.isActive());
        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> getMyExtendedProfile(Authentication authentication) {
        return userService.getMyProfile(authentication.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/me/notification-prefs")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> updateMyNotificationPrefs(Authentication authentication,
                                                       @RequestBody UpdateNotificationPrefsRequest request) {
        if (request == null || request.getNotificationPrefs() == null) {
            return ResponseEntity.badRequest().body("Notification preferences are required");
        }

        return userService.updateNotificationPrefs(authentication.getName(), request.getNotificationPrefs())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
