package com.smartcampus.user;

import com.smartcampus.audit.service.AuditLogService;
import com.smartcampus.common.entity.Role;
import com.smartcampus.user.dto.UserResponse;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public Optional<UserResponse> getMyProfile(String email) {
        return userRepository.findByEmail(email).map(UserResponse::from);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<UserResponse> getUserById(UUID id) {
        return userRepository.findById(id).map(UserResponse::from);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public List<UserResponse> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream().map(UserResponse::from).toList();
    }

    public boolean updateUserRole(UUID id, Role role) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return false;
        }

        Role oldRole = user.getRole();
        user.setRole(role);
        userRepository.save(user);
        auditLogService.log("ROLE_UPDATE", "USER", id.toString(), "User role changed from " + oldRole + " to " + role);
        return true;
    }

    public boolean updateUserStatus(UUID id, boolean isActive) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return false;
        }

        boolean oldStatus = user.isActive();
        user.setActive(isActive);
        userRepository.save(user);
        auditLogService.log("STATUS_UPDATE", "USER", id.toString(), "User status changed from " + oldStatus + " to " + isActive);
        return true;
    }

    public boolean deactivateUser(UUID id) {
        return updateUserStatus(id, false);
    }

    public Optional<UserResponse> updateNotificationPrefs(String email, Map<String, Boolean> notificationPrefs) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return Optional.empty();
        }

        user.setNotificationPrefs(notificationPrefs);
        userRepository.save(user);
        auditLogService.log("NOTIFICATION_PREFS_UPDATE", "USER", user.getId().toString(), "Notification preferences updated");
        return Optional.of(UserResponse.from(user));
    }
}
