package com.smartcampus.notification.controller;

import com.smartcampus.notification.dto.EmailTesterRequest;
import com.smartcampus.notification.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Dev/admin endpoint for testing every email template.
 *
 * POST /api/emailTester
 * {
 *   "to":      "recipient@example.com",
 *   "type":    "VERIFICATION | WELCOME | RESET | NOTIFICATION | PROMOTIONAL | SUPPORT | UPDATE | TICKET | CUSTOM",
 *   "subject": "Optional subject override",
 *   "message": "Optional body text"
 * }
 */
@RestController
@RequestMapping("/api/emailTester")
public class EmailTesterController {

    private final EmailService emailService;

    public EmailTesterController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> testEmail(@RequestBody EmailTesterRequest request) {
        if (request.getTo() == null || request.getTo().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "'to' email address is required"));
        }

        String type    = request.getType()    != null ? request.getType().toUpperCase()   : "CUSTOM";
        String subject = request.getSubject() != null ? request.getSubject()               : "HelaUni – Test Email";
        String message = request.getMessage() != null ? request.getMessage()               : "This is a test email from HelaUni Smart Campus.";
        String to      = request.getTo();

        switch (type) {
            case "VERIFICATION":
                emailService.sendVerificationEmail(to, "https://helauni.app/verify?token=demo-token-12345");
                break;

            case "WELCOME":
                emailService.sendWelcomeEmail(to, subject); // subject field reused as fullName for test
                break;

            case "RESET":
                emailService.sendPasswordResetEmail(to, "https://helauni.app/reset-password?token=demo-reset-token");
                break;

            case "NOTIFICATION":
                emailService.sendNotificationEmail(to, subject, message);
                break;

            case "PROMOTIONAL":
                emailService.sendPromotionalEmail(to, subject, message);
                break;

            case "SUPPORT":
                emailService.sendSupportEmail(to, subject, message);
                break;

            case "UPDATE":
                emailService.sendUpdateEmail(to, subject, message);
                break;

            case "TICKET":
                emailService.sendTicketConfirmationEmail(to, "TKT-2026-0042", subject, "IN_PROGRESS", message);
                break;

            case "CUSTOM":
            default:
                emailService.sendCustomEmail(to, subject, message);
                break;
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Email initiated for type: " + type,
            "recipient", to
        ));
    }
}
