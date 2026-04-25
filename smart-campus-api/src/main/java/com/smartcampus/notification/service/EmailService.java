package com.smartcampus.notification.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Resend resend;
    private final String fromEmail;
    private final boolean enabled;

    public EmailService(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:onboarding@resend.dev}") String fromEmail) {
        
        this.fromEmail = fromEmail;
        this.enabled = apiKey != null && !apiKey.trim().isEmpty();
        
        if (this.enabled) {
            this.resend = new Resend(apiKey);
            log.info("EmailService initialized with Resend.");
        } else {
            this.resend = null;
            log.warn("Resend API key is not configured. Emails will NOT be sent.");
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Smart Campus - Password Reset Request";
        String htmlBody = String.format(
            "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #191a1b;\">" +
            "<h2 style=\"color: #191a1b;\">Password Reset Request</h2>" +
            "<p>You requested to reset your password for your Smart Campus account. Please click the link below to set a new password:</p>" +
            "<div style=\"margin: 30px 0;\">" +
            "<a href=\"%s\" style=\"background-color: #5e6ad2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;\">Reset Password</a>" +
            "</div>" +
            "<p>If you didn't request this, you can safely ignore this email.</p>" +
            "<p>The link will expire in 24 hours.</p>" +
            "</div>", resetLink);

        sendEmail(to, subject, htmlBody);
    }

    @Async
    public void sendNotificationEmail(String to, String subject, String message) {
        String htmlBody = String.format(
            "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #191a1b;\">" +
            "<h2 style=\"color: #191a1b;\">%s</h2>" +
            "<p style=\"color: #43464b; white-space: pre-wrap;\">%s</p>" +
            "<hr style=\"border: none; border-top: 1px solid #e2e6eb; margin: 30px 0;\" />" +
            "<p style=\"color: #8a8f98; font-size: 12px;\">This is an automated notification from Smart Campus.</p>" +
            "</div>", subject, message);

        sendEmail(to, subject, htmlBody);
    }

    @Async
    public void sendPromotionalEmail(String to, String subject, String message) {
        String htmlBody = String.format(
            "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #191a1b; background-color: #f9fafb; padding: 20px; border-radius: 8px;\">" +
            "<div style=\"text-align: center; margin-bottom: 20px;\">" +
            "<h1 style=\"color: #5e6ad2; margin: 0;\">HelaUni Updates</h1>" +
            "</div>" +
            "<div style=\"background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);\">" +
            "<h2 style=\"color: #191a1b; margin-top: 0;\">%s</h2>" +
            "<p style=\"color: #43464b; line-height: 1.6; white-space: pre-wrap;\">%s</p>" +
            "<div style=\"text-align: center; margin-top: 30px;\">" +
            "<a href=\"https://helauni.app\" style=\"background-color: #5e6ad2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Explore Now</a>" +
            "</div>" +
            "</div>" +
            "<p style=\"color: #8a8f98; font-size: 12px; text-align: center; margin-top: 20px;\">You are receiving this email because you opted in to promotional updates from HelaUni.</p>" +
            "</div>", subject, message);

        sendEmail(to, subject, htmlBody);
    }

    @Async
    public void sendSupportEmail(String to, String subject, String message) {
        String htmlBody = String.format(
            "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #191a1b; border: 1px solid #e2e6eb; border-top: 4px solid #f59e0b; border-radius: 8px; padding: 30px;\">" +
            "<h2 style=\"color: #191a1b; margin-top: 0;\">HelaUni Support</h2>" +
            "<h3 style=\"color: #43464b;\">%s</h3>" +
            "<p style=\"color: #43464b; line-height: 1.6; white-space: pre-wrap;\">%s</p>" +
            "<hr style=\"border: none; border-top: 1px solid #e2e6eb; margin: 30px 0;\" />" +
            "<p style=\"color: #8a8f98; font-size: 12px;\">Our support team is reviewing your request. If you have any additional information, please reply to this email.</p>" +
            "</div>", subject, message);

        sendEmail(to, subject, htmlBody);
    }

    @Async
    public void sendUpdateEmail(String to, String subject, String message) {
        String htmlBody = String.format(
            "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #191a1b;\">" +
            "<div style=\"background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;\">" +
            "<h2 style=\"margin: 0;\">System Update</h2>" +
            "</div>" +
            "<div style=\"border: 1px solid #e2e6eb; border-top: none; border-radius: 0 0 8px 8px; padding: 30px;\">" +
            "<h3 style=\"color: #191a1b; margin-top: 0;\">%s</h3>" +
            "<p style=\"color: #43464b; line-height: 1.6; white-space: pre-wrap;\">%s</p>" +
            "</div>" +
            "<p style=\"color: #8a8f98; font-size: 12px; text-align: center; margin-top: 20px;\">This is an important system update from HelaUni.</p>" +
            "</div>", subject, message);

        sendEmail(to, subject, htmlBody);
    }

    @Async
    public void sendCustomEmail(String to, String subject, String htmlMessage) {
        // Assume htmlMessage is already formatted HTML
        sendEmail(to, subject, htmlMessage);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.info("MOCK EMAIL SENT TO {}: Subject: '{}'", to, subject);
            return;
        }

        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                .from("Smart Campus <" + fromEmail + ">")
                .to(to)
                .subject(subject)
                .html(htmlBody)
                .build();

            CreateEmailResponse data = resend.emails().send(params);
            log.info("Email successfully sent. ID: {}", data.getId());
        } catch (ResendException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}
