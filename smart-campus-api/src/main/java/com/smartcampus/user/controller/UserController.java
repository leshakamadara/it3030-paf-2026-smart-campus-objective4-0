package com.smartcampus.user.controller;

import com.smartcampus.audit.service.AuditLogService;
import com.smartcampus.common.entity.Role;
import com.smartcampus.user.dto.UserDto;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.mapper.UserMapper;
import com.smartcampus.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public UserController(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(UserMapper.INSTANCE::userToUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Role role) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Role oldRole = user.getRole();
        user.setRole(role);
        userRepository.save(user);
        auditLogService.log("ROLE_UPDATE", "USER", id, "User role changed from " + oldRole + " to " + role);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody boolean isActive) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        boolean oldStatus = user.isActive();
        user.setActive(isActive);
        userRepository.save(user);
        auditLogService.log("STATUS_UPDATE", "USER", id, "User status changed from " + oldStatus + " to " + isActive);
        return ResponseEntity.ok().build();
    }
}
