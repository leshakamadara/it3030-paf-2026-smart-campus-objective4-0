package com.smartcampus.notification.dto;

import com.smartcampus.notification.entity.Notification;
import com.smartcampus.notification.entity.NotificationType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        NotificationType type,
        String title,
        String message,
        boolean isRead,
        String entityType,
        UUID entityId,
        OffsetDateTime readAt,
        OffsetDateTime createdAt
) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getEntityType(),
                notification.getEntityId(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
