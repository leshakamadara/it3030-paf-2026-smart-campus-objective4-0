package com.smartcampus.notification.service;

import com.smartcampus.notification.dto.NotificationPageResponse;
import com.smartcampus.notification.dto.NotificationResponse;
import com.smartcampus.notification.entity.Notification;
import com.smartcampus.notification.entity.NotificationType;
import com.smartcampus.notification.repository.NotificationRepository;
import com.smartcampus.user.repository.UserRepository;
import com.smartcampus.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            EmailService emailService,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Domain event entry-points (called by BookingService, TicketServiceImpl)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Fire a notification for the given user.
     * Runs in a new transaction so a caller failure doesn't roll back the notification,
     * and the notification doesn't prevent the caller from completing.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void send(UUID userId, NotificationType type, String title, String message,
                     String entityType, UUID entityId) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setEntityType(entityType);
            notification.setEntityId(entityId);
            notificationRepository.save(notification);

            // Send email for bookings and tickets
            if (type.name().contains("BOOKING") || type.name().contains("TICKET")) {
                
                userRepository.findById(userId).ifPresent(user -> {
                    // Note: In the future, we could check user.getNotificationPrefs() here.
                    // For now, we send emails for all booking/ticket updates.
                    emailService.sendNotificationEmail(user.getEmail(), title, message);
                });
            }
        } catch (Exception ex) {
            log.error("Failed to persist notification for userId={} type={}: {}", userId, type, ex.getMessage(), ex);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // REST-layer reads / writes
    // ──────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public NotificationPageResponse getNotifications(UUID userId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notificationPage = notificationRepository.findByUserId(userId, pageable);

        List<NotificationResponse> content = notificationPage
                .stream()
                .map(NotificationResponse::from)
                .toList();

        return new NotificationPageResponse(
                content,
                notificationPage.getNumber(),
                notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(OffsetDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsRead(userId, OffsetDateTime.now());
    }

    @Transactional
    public void deleteNotification(UUID userId, UUID notificationId) {
        int deleted = notificationRepository.deleteByIdAndUserId(notificationId, userId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        }
    }
}
