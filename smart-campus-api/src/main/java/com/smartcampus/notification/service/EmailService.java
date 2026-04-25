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

    // ── Brand assets ──────────────────────────────────────────────────────────
    private static final String LOGO_SVG =
        "<svg width=\"36\" height=\"36\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">" +
        "<circle cx=\"34\" cy=\"34\" r=\"27\" fill=\"#5e6ad2\"/>" +
        "<circle cx=\"66\" cy=\"34\" r=\"27\" fill=\"#dde0f5\"/>" +
        "<circle cx=\"34\" cy=\"66\" r=\"27\" fill=\"#dde0f5\"/>" +
        "<circle cx=\"66\" cy=\"66\" r=\"27\" fill=\"#5e6ad2\"/>" +
        "</svg>";

    // ── Palette (DESIGN.md light theme) ───────────────────────────────────────
    private static final String C_BG         = "#f3f4f5";
    private static final String C_CARD       = "#ffffff";
    private static final String C_BORDER     = "#e6e6e6";
    private static final String C_TEXT_PRI   = "#191a1b";
    private static final String C_TEXT_BODY  = "#43464b";
    private static final String C_TEXT_MUTED = "#8a8f98";
    private static final String C_BRAND      = "#5e6ad2";
    private static final String C_SUCCESS    = "#10b981";
    private static final String C_WARNING    = "#f59e0b";
    private static final String C_INFO       = "#3b82f6";
    private static final String C_SURFACE    = "#f7f8f8";

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

    // ═══════════════════════════════════════════════════════════════════════════
    // Public email methods
    // ═══════════════════════════════════════════════════════════════════════════

    /** Password reset request email */
    @Async
    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Reset your HelaUni password";
        String body =
            h1("Reset your password") +
            p("We received a request to reset the password for your HelaUni account. " +
              "Click the button below to choose a new password. This link is valid for <strong style=\"color:" + C_TEXT_PRI + ";\">24 hours</strong>.") +
            cta(resetLink, "Reset Password", C_BRAND) +
            infoBox("&#x1F512;&nbsp; If you didn't request a password reset, you can safely ignore this email. " +
                    "Your password will not change.", C_SURFACE, C_BORDER, C_TEXT_MUTED);

        sendEmail(to, subject, buildLayout(C_BRAND, subject, body,
            "This email was sent because a password reset was requested for your HelaUni account."));
    }

    /** Email address verification email */
    @Async
    public void sendVerificationEmail(String to, String verificationLink) {
        String subject = "Verify your HelaUni email address";
        String body =
            badge("Email Verification", "#ede9ff", "#c4b5fd", C_BRAND) +
            h1("Confirm your email address") +
            p("Thanks for signing up to HelaUni Smart Campus. Please verify your email address by clicking the button below to activate your account.") +
            cta(verificationLink, "Verify Email Address", C_BRAND) +
            infoBox("This verification link expires in 24 hours. " +
                    "If you didn't create a HelaUni account, please ignore this email.", C_SURFACE, C_BORDER, C_TEXT_MUTED);

        sendEmail(to, subject, buildLayout(C_BRAND, subject, body,
            "You're receiving this because someone signed up to HelaUni with this email address."));
    }

    /** Welcome / join us email sent after first successful login */
    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        String subject = "Welcome to HelaUni \uD83C\uDF89";
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "there";
        String body =
            badge("Welcome", "#d1fae5", "#6ee7b7", "#065f46") +
            h1("Welcome to HelaUni, " + escHtml(name) + "! \uD83C\uDF89") +
            p("Your Smart Campus account is all set up. Here's a quick look at what you can do:") +
            featureList() +
            cta("https://helauni.app/dashboard", "Go to Dashboard", C_SUCCESS) +
            "<p style=\"margin:28px 0 0 0; font-size:14px; color:" + C_TEXT_MUTED + "; line-height:1.6;\">" +
            "Have questions? Just reply to this email — we're happy to help.</p>";

        sendEmail(to, subject, buildLayout(C_SUCCESS, subject, body,
            "You're receiving this because you just joined HelaUni Smart Campus."));
    }

    /** System / booking / ticket notification email */
    @Async
    public void sendNotificationEmail(String to, String subject, String message) {
        String body =
            h1(escHtml(subject)) +
            p(escHtml(message)) +
            divider() +
            muted("You're receiving this notification based on your HelaUni account preferences.");

        sendEmail(to, subject, buildLayout(C_BRAND, subject, body,
            "This is an automated notification from HelaUni Smart Campus."));
    }

    /** Promotional / marketing email */
    @Async
    public void sendPromotionalEmail(String to, String subject, String message) {
        String body =
            badge("HelaUni Updates", "#ede9ff", "#c4b5fd", C_BRAND) +
            h1(escHtml(subject)) +
            p(escHtml(message)) +
            cta("https://helauni.app", "Explore HelaUni", C_BRAND) +
            divider() +
            muted("You're receiving this because you opted in to updates from HelaUni. " +
                  "Update your preferences in <a href=\"https://helauni.app/dashboard/settings\" " +
                  "style=\"color:" + C_BRAND + "; text-decoration:none;\">account settings</a>.");

        sendEmail(to, subject, buildLayout(C_BRAND, subject, body,
            "To unsubscribe, update your notification preferences in your account settings."));
    }

    /** Support ticket acknowledgement email */
    @Async
    public void sendSupportEmail(String to, String subject, String message) {
        String body =
            badge("Support", "#fef3c7", "#fde68a", "#92400e") +
            h1(escHtml(subject)) +
            p(escHtml(message)) +
            infoBox("Our support team is reviewing your request. Expected response time is within 24 hours. " +
                    "You can reply directly to this email with any additional information.", "#fffbeb", "#fde68a", "#92400e") +
            divider() +
            muted("HelaUni Support &middot; <a href=\"mailto:support@helauni.app\" " +
                  "style=\"color:" + C_BRAND + "; text-decoration:none;\">support@helauni.app</a>");

        sendEmail(to, subject, buildLayout(C_WARNING, subject, body,
            "This is a support update from HelaUni Smart Campus."));
    }

    /** System update / announcement email */
    @Async
    public void sendUpdateEmail(String to, String subject, String message) {
        String body =
            badge("System Update", "#f0fdf4", "#bbf7d0", "#166534") +
            h1(escHtml(subject)) +
            p(escHtml(message)) +
            infoBox("This update affects your HelaUni Smart Campus experience. " +
                    "No action is required unless stated above.", "#f0fdf4", "#bbf7d0", "#166534") +
            divider() +
            muted("This is an important system update from HelaUni Smart Campus.");

        sendEmail(to, subject, buildLayout(C_SUCCESS, subject, body,
            "You're receiving this important system update because you are a registered HelaUni member."));
    }

    /** Ticket / booking confirmation email */
    @Async
    public void sendTicketConfirmationEmail(String to, String ticketRef, String title, String status, String description) {
        String subject = "Ticket Confirmed: " + title;
        String[] statusStyle = resolveStatusStyle(status);
        String body =
            h1("Your ticket is confirmed") +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
            "style=\"margin-bottom:24px; padding:20px; background-color:" + C_SURFACE + "; " +
            "border-radius:8px; border:1px solid " + C_BORDER + ";\">" +
            "<tr>" +
            "<td style=\"padding-bottom:14px;\">" +
            "<span style=\"font-size:11px; font-weight:600; color:" + C_TEXT_MUTED + "; letter-spacing:0.6px; text-transform:uppercase;\">Ticket Reference</span><br>" +
            "<span style=\"font-size:16px; font-weight:600; color:" + C_TEXT_PRI + "; font-family:monospace,monospace; letter-spacing:0.5px;\">" + escHtml(ticketRef) + "</span>" +
            "</td>" +
            "<td align=\"right\" style=\"padding-bottom:14px; vertical-align:top;\">" +
            "<span style=\"display:inline-block; padding:5px 14px; border-radius:9999px; font-size:12px; font-weight:600; background-color:" + statusStyle[0] + "; color:" + statusStyle[1] + ";\">" + escHtml(status) + "</span>" +
            "</td>" +
            "</tr>" +
            "<tr><td colspan=\"2\">" +
            "<span style=\"font-size:11px; font-weight:600; color:" + C_TEXT_MUTED + "; letter-spacing:0.6px; text-transform:uppercase;\">Subject</span><br>" +
            "<span style=\"font-size:15px; color:" + C_TEXT_PRI + ";\">" + escHtml(title) + "</span>" +
            "</td></tr>" +
            "</table>" +
            (description != null && !description.isBlank() ? p(escHtml(description)) : "") +
            cta("https://helauni.app/dashboard/tickets", "View Ticket Details", C_BRAND) +
            divider() +
            muted("Keep this email as a reference. Our team will notify you of any status changes.");

        sendEmail(to, subject, buildLayout(C_SUCCESS, subject, body,
            "This is a confirmation for your support ticket submitted to HelaUni Smart Campus."));
    }

    /** Custom email — body HTML is wrapped in the branded layout */
    @Async
    public void sendCustomEmail(String to, String subject, String htmlMessage) {
        sendEmail(to, subject, buildLayout(C_BRAND, subject, htmlMessage,
            "This is a message from HelaUni Smart Campus."));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Private layout builders
    // ═══════════════════════════════════════════════════════════════════════════

    private String buildLayout(String accentColor, String title, String bodyContent, String footerNote) {
        return "<!DOCTYPE html>" +
            "<html lang=\"en\"><head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">" +
            "<title>" + escHtml(title) + " – HelaUni</title>" +
            "</head>" +
            "<body style=\"margin:0;padding:0;background-color:" + C_BG + ";font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;\">" +
            // Outer table
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:" + C_BG + ";\">" +
            "<tr><td align=\"center\" style=\"padding:40px 16px 48px 16px;\">" +
            // Inner 600px container
            "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;width:100%;\">" +

            // ── Logo header ─────────────────────────────────────────────────
            "<tr><td align=\"center\" style=\"padding-bottom:28px;\">" +
            "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>" +
            "<td style=\"padding-right:10px;vertical-align:middle;line-height:1;\">" + LOGO_SVG + "</td>" +
            "<td style=\"vertical-align:middle;\">" +
            "<span style=\"font-size:20px;font-weight:700;color:" + C_TEXT_PRI + ";letter-spacing:-0.4px;\">HelaUni</span>" +
            "</td></tr></table>" +
            "</td></tr>" +

            // ── Card ─────────────────────────────────────────────────────────
            "<tr><td style=\"background-color:" + C_CARD + ";border-radius:12px;border:1px solid " + C_BORDER + ";overflow:hidden;" +
            "box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04);\">" +
            // Accent stripe
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" +
            "<tr><td style=\"height:4px;background-color:" + accentColor + ";border-radius:12px 12px 0 0;\"></td></tr>" +
            "</table>" +
            // Card body
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" +
            "<tr><td style=\"padding:40px 48px 40px 48px;\">" +
            bodyContent +
            "</td></tr></table>" +
            "</td></tr>" +

            // ── Footer ───────────────────────────────────────────────────────
            "<tr><td align=\"center\" style=\"padding-top:32px;\">" +
            "<p style=\"margin:0 0 6px 0;font-size:13px;color:" + C_TEXT_MUTED + ";line-height:1.6;\">" + footerNote + "</p>" +
            "<p style=\"margin:0;font-size:12px;color:#b0b5bd;\">" +
            "&copy; 2026 HelaUni &middot; Smart Campus Platform &middot; " +
            "<a href=\"https://helauni.app\" style=\"color:#b0b5bd;text-decoration:none;\">helauni.app</a>" +
            "</p>" +
            "</td></tr>" +

            "</table>" +   // inner
            "</td></tr>" +
            "</table>" +   // outer
            "</body></html>";
    }

    // ─── HTML snippet helpers ─────────────────────────────────────────────────

    private String h1(String text) {
        return "<h1 style=\"margin:0 0 12px 0;font-size:24px;font-weight:700;color:" + C_TEXT_PRI +
               ";letter-spacing:-0.4px;line-height:1.3;\">" + text + "</h1>";
    }

    private String p(String text) {
        return "<p style=\"margin:0 0 20px 0;font-size:15px;color:" + C_TEXT_BODY +
               ";line-height:1.7;white-space:pre-wrap;\">" + text + "</p>";
    }

    private String muted(String text) {
        return "<p style=\"margin:0;font-size:13px;color:" + C_TEXT_MUTED + ";line-height:1.6;\">" + text + "</p>";
    }

    private String divider() {
        return "<hr style=\"border:none;border-top:1px solid " + C_BORDER + ";margin:28px 0;\"/>";
    }

    private String cta(String href, String label, String color) {
        return "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:28px 0;\">" +
               "<tr><td style=\"border-radius:8px;background-color:" + color + ";\">" +
               "<a href=\"" + href + "\" " +
               "style=\"display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;" +
               "color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.1px;\">" +
               label + "</a>" +
               "</td></tr></table>";
    }

    private String badge(String label, String bg, String border, String color) {
        return "<div style=\"display:inline-block;margin-bottom:16px;padding:4px 14px;" +
               "background-color:" + bg + ";border-radius:9999px;border:1px solid " + border + ";\">" +
               "<span style=\"font-size:11px;font-weight:700;color:" + color +
               ";letter-spacing:0.6px;text-transform:uppercase;\">" + label + "</span>" +
               "</div><br/>";
    }

    private String infoBox(String text, String bg, String border, String textColor) {
        return "<div style=\"margin:20px 0 0 0;padding:16px 20px;background-color:" + bg +
               ";border-radius:8px;border:1px solid " + border + ";\">" +
               "<p style=\"margin:0;font-size:13px;color:" + textColor + ";line-height:1.6;\">" +
               text + "</p></div>";
    }

    private String featureList() {
        String[][] features = {
            {"\uD83D\uDCCB", "Book Resources",    "Reserve labs, lecture halls, and campus facilities."},
            {"\uD83D\uDD14", "Notifications",      "Stay updated on bookings, tickets, and campus alerts."},
            {"\uD83D\uDEE0\uFE0F", "Raise Tickets", "Submit and track maintenance & incident reports."},
            {"\uD83D\uDCCA", "Dashboard",           "Get a real-time overview of your campus activity."}
        };
        StringBuilder sb = new StringBuilder();
        sb.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:0 0 28px 0;\">");
        for (String[] f : features) {
            sb.append("<tr>")
              .append("<td style=\"padding:10px 0;vertical-align:top;width:36px;font-size:20px;\">").append(f[0]).append("</td>")
              .append("<td style=\"padding:10px 0 10px 8px;\">")
              .append("<strong style=\"font-size:14px;font-weight:600;color:").append(C_TEXT_PRI).append(";display:block;\">").append(f[1]).append("</strong>")
              .append("<span style=\"font-size:13px;color:").append(C_TEXT_MUTED).append(";\">").append(f[2]).append("</span>")
              .append("</td>")
              .append("</tr>");
        }
        sb.append("</table>");
        return sb.toString();
    }

    /** Returns [bgColor, textColor] for a given ticket status string. */
    private String[] resolveStatusStyle(String status) {
        if (status == null) return new String[]{"#f3f4f5", C_TEXT_MUTED};
        switch (status.toUpperCase()) {
            case "OPEN":         return new String[]{"#ede9ff", "#5e6ad2"};
            case "IN_PROGRESS":  return new String[]{"#fef3c7", "#92400e"};
            case "RESOLVED":
            case "CLOSED":       return new String[]{"#d1fae5", "#065f46"};
            case "REJECTED":     return new String[]{"#fee2e2", "#991b1b"};
            default:             return new String[]{C_SURFACE, C_TEXT_MUTED};
        }
    }

    /** Minimal HTML escaping for user-supplied strings */
    private String escHtml(String input) {
        if (input == null) return "";
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Core send
    // ═══════════════════════════════════════════════════════════════════════════

    private void sendEmail(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.info("MOCK EMAIL → {}: Subject: '{}'", to, subject);
            return;
        }
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                .from("HelaUni <" + fromEmail + ">")
                .to(to)
                .subject(subject)
                .html(htmlBody)
                .build();
            CreateEmailResponse data = resend.emails().send(params);
            log.info("Email sent successfully. ID: {}", data.getId());
        } catch (ResendException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}
