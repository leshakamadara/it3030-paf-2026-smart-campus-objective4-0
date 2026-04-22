package com.smartcampus.auth.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.smartcampus.common.entity.Role;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.repository.UserRepository;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSignupKeyService adminSignupKeyService;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminSignupKeyService adminSignupKeyService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminSignupKeyService = adminSignupKeyService;
    }

    public User processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");
        String googleSub = oAuth2User.getAttribute("sub");

        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("OAuth2 email claim is missing");
        }

        Optional<User> userOptional = StringUtils.hasText(googleSub)
                ? userRepository.findByGoogleSub(googleSub).or(() -> userRepository.findByEmail(email))
                : userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            updateUser(user, fullName, avatarUrl, googleSub);
        } else {
            user = registerNewUser(email, fullName, avatarUrl, googleSub);
        }

        if (!user.isActive()) {
            throw new DisabledException("User account is disabled");
        }

        return user;
    }

    public User processDevelopmentLogin(String email, String fullName) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(StringUtils.hasText(fullName) ? fullName : email);
            newUser.setRole(Role.USER);
            newUser.setActive(true);
            newUser.setNotificationPrefs(defaultNotificationPrefs());
            return newUser;
        });

        if (!user.isActive()) {
            throw new DisabledException("User account is disabled");
        }

        user.setLastLoginAt(Instant.now());
        if (!StringUtils.hasText(user.getFullName())) {
            user.setFullName(StringUtils.hasText(fullName) ? fullName : email);
        }
        if (user.getNotificationPrefs() == null || user.getNotificationPrefs().isEmpty()) {
            user.setNotificationPrefs(defaultNotificationPrefs());
        }

        return userRepository.save(user);
    }

    public User registerCampusUser(String email, String fullName, String rawPassword) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(rawPassword)) {
            throw new IllegalArgumentException("Email and password are required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("User already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setFullName(StringUtils.hasText(fullName) ? fullName : email);
        user.setRole(Role.USER);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setLastLoginAt(Instant.now());
        user.setNotificationPrefs(defaultNotificationPrefs());

        return userRepository.save(user);
    }

    public User loginCampusUser(String email, String rawPassword) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(rawPassword)) {
            throw new IllegalArgumentException("Email and password are required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()) {
            throw new DisabledException("User account is disabled");
        }

        if (!StringUtils.hasText(user.getPasswordHash()) || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        user.setLastLoginAt(Instant.now());
        if (user.getNotificationPrefs() == null || user.getNotificationPrefs().isEmpty()) {
            user.setNotificationPrefs(defaultNotificationPrefs());
        }

        return userRepository.save(user);
    }

    public User registerAdminUser(String email, String fullName, String rawPassword, String adminSignupKey) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(rawPassword)) {
            throw new IllegalArgumentException("Email, password and admin signup key are required");
        }

        if (!StringUtils.hasText(adminSignupKey)) {
            throw new IllegalArgumentException("Admin signup key is required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("User already exists");
        }

        adminSignupKeyService.consumeKeyOrThrow(adminSignupKey, email);

        User user = new User();
        user.setEmail(email);
        user.setFullName(StringUtils.hasText(fullName) ? fullName : email);
        user.setRole(Role.ADMIN);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setLastLoginAt(Instant.now());
        user.setNotificationPrefs(defaultNotificationPrefs());

        return userRepository.save(user);
    }

    private User registerNewUser(String email, String fullName, String avatarUrl, String googleSub) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(StringUtils.hasText(fullName) ? fullName : email);
        user.setAvatarUrl(avatarUrl);
        user.setGoogleSub(googleSub);
        user.setRole(Role.USER);
        user.setActive(true);
        user.setLastLoginAt(Instant.now());
        user.setNotificationPrefs(defaultNotificationPrefs());

        return userRepository.save(user);
    }

    private void updateUser(User existingUser, String fullName, String avatarUrl, String googleSub) {
        existingUser.setFullName(StringUtils.hasText(fullName) ? fullName : existingUser.getEmail());
        existingUser.setAvatarUrl(avatarUrl);
        if (existingUser.getRole() == null) {
            existingUser.setRole(Role.USER);
        }
        if (StringUtils.hasText(googleSub)) {
            existingUser.setGoogleSub(googleSub);
        }
        existingUser.setLastLoginAt(Instant.now());
        if (existingUser.getNotificationPrefs() == null || existingUser.getNotificationPrefs().isEmpty()) {
            existingUser.setNotificationPrefs(defaultNotificationPrefs());
        }

        userRepository.save(existingUser);
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
