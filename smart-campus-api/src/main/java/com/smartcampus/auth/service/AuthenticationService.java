package com.smartcampus.auth.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.OffsetDateTime;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.smartcampus.common.entity.Role;
import com.smartcampus.user.entity.User;
import com.smartcampus.user.repository.UserRepository;
import com.smartcampus.user.repository.PasswordResetTokenRepository;
import com.smartcampus.user.entity.PasswordResetToken;
import com.smartcampus.notification.service.EmailService;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSignupKeyService adminSignupKeyService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminSignupKeyService adminSignupKeyService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminSignupKeyService = adminSignupKeyService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
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

        User saved = userRepository.save(user);

        // Send welcome email asynchronously — failure must not abort registration
        try {
            emailService.sendWelcomeEmail(saved.getEmail(), saved.getFullName());
        } catch (Exception ex) {
            // log silently; email is best-effort
        }

        return saved;
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

    @Transactional
    public void generatePasswordResetToken(String email, String frontendUrl) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !StringUtils.hasText(user.getPasswordHash())) {
            // Either user doesn't exist, or they are Google-only
            // To prevent user enumeration, we just return silently
            return;
        }

        // Generate token
        String token = UUID.randomUUID().toString();
        
        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());
        
        // Save new token
        PasswordResetToken resetToken = new PasswordResetToken(
            token, user, OffsetDateTime.now().plusHours(24)
        );
        passwordResetTokenRepository.save(resetToken);
        
        // Send email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
            
        if (OffsetDateTime.now().isAfter(resetToken.getExpiryDate())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token has expired");
        }
        
        if (!StringUtils.hasText(newPassword)) {
            throw new IllegalArgumentException("New password is required");
        }
        
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        passwordResetTokenRepository.delete(resetToken);
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

        User saved = userRepository.save(user);

        // Send welcome email for first-time OAuth sign-ups
        try {
            emailService.sendWelcomeEmail(saved.getEmail(), saved.getFullName());
        } catch (Exception ex) {
            // log silently; email is best-effort
        }

        return saved;
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
