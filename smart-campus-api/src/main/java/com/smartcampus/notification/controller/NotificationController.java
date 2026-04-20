package com.smartcampus.notification.controller;

import com.smartcampus.notification.dto.NotificationPageResponse;
import com.smartcampus.notification.dto.NotificationResponse;
import com.smartcampus.notification.service.CurrentUserContextService;
import com.smartcampus.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserContextService currentUserContextService;

    public NotificationController(NotificationService notificationService,
                                  CurrentUserContextService currentUserContextService) {
        this.notificationService = notificationService;
        this.currentUserContextService = currentUserContextService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<NotificationPageResponse> getMyNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = currentUserContextService.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(notificationService.getNotifications(userId, page, size));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        UUID userId = currentUserContextService.resolveCurrentUserId(authentication);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<NotificationResponse> markSingleAsRead(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        UUID userId = currentUserContextService.resolveCurrentUserId(authentication);
        NotificationResponse updated = notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(Authentication authentication) {
        UUID userId = currentUserContextService.resolveCurrentUserId(authentication);
        int updated = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNotification(Authentication authentication, @PathVariable UUID id) {
        UUID userId = currentUserContextService.resolveCurrentUserId(authentication);
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.noContent().build();
    }
}
