package com.smartcampus.notification.controller;

import com.smartcampus.notification.dto.EmailTesterRequest;
import com.smartcampus.notification.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/emailTester")
public class EmailTesterController {

    private final EmailService emailService;

    public EmailTesterController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> testEmail(@RequestBody EmailTesterRequest request) {
        if (request.getTo() == null || request.getTo().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "'to' email address is required"));
        }

        String type = request.getType() != null ? request.getType().toUpperCase() : "CUSTOM";
        String subject = request.getSubject() != null ? request.getSubject() : "HelaUni Test Email";
        String message = request.getMessage() != null ? request.getMessage() : "This is a test email message.";

        switch (type) {
            case "PROMOTIONAL":
                emailService.sendPromotionalEmail(request.getTo(), subject, message);
                break;
            case "SUPPORT":
                emailService.sendSupportEmail(request.getTo(), subject, message);
                break;
            case "UPDATE":
                emailService.sendUpdateEmail(request.getTo(), subject, message);
                break;
            case "CUSTOM":
            default:
                emailService.sendCustomEmail(request.getTo(), subject, message);
                break;
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Email initiated for type: " + type));
    }
}
