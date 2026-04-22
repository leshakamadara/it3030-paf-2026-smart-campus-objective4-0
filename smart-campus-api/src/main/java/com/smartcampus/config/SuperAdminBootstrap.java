package com.smartcampus.config;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.smartcampus.common.entity.Role;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.repository.UserRepository;

@Component
public class SuperAdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.email:}")
    private String bootstrapEmail;

    @Value("${app.super-admin.password:}")
    private String bootstrapPassword;

    @Value("${app.super-admin.full-name:Super Admin}")
    private String bootstrapFullName;

    public SuperAdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = bootstrapEmail;
        String password = bootstrapPassword;
        String fullName = bootstrapFullName;

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.info("Super admin bootstrap skipped: APP_SUPER_ADMIN_EMAIL or APP_SUPER_ADMIN_PASSWORD is not set");
            return;
        }

        Optional<User> existing = userRepository.findByEmail(email.trim());
        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;

            if (user.getRole() != Role.SUPER_ADMIN) {
                user.setRole(Role.SUPER_ADMIN);
                changed = true;
            }

            if (!user.isActive()) {
                user.setActive(true);
                changed = true;
            }

            if (!StringUtils.hasText(user.getPasswordHash()) || !passwordEncoder.matches(password, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(password));
                changed = true;
            }

            if (!StringUtils.hasText(user.getFullName())) {
                user.setFullName(StringUtils.hasText(fullName) ? fullName : "Super Admin");
                changed = true;
            }

            if (user.getNotificationPrefs() == null || user.getNotificationPrefs().isEmpty()) {
                user.setNotificationPrefs(defaultNotificationPrefs());
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
                log.info("Super admin account updated for {}", email);
            } else {
                log.info("Super admin account already configured for {}", email);
            }
            return;
        }

        User user = new User();
        user.setEmail(email.trim());
        user.setFullName(StringUtils.hasText(fullName) ? fullName : "Super Admin");
        user.setRole(Role.SUPER_ADMIN);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setNotificationPrefs(defaultNotificationPrefs());

        userRepository.save(user);
        log.info("Super admin account bootstrapped for {}", email);
    }

    private Map<String, Boolean> defaultNotificationPrefs() {
        Map<String, Boolean> prefs = new LinkedHashMap<>();
        prefs.put("BOOKING_APPROVED", true);
        prefs.put("BOOKING_REJECTED", true);
        prefs.put("BOOKING_REMINDER", true);
        prefs.put("TICKET_UPDATED", true);
        prefs.put("SYSTEM_ALERT", true);
        return prefs;
    }
}
