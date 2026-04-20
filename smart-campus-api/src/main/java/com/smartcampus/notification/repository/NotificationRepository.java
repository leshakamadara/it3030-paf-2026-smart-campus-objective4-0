package com.smartcampus.notification.repository;

import com.smartcampus.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserId(UUID userId, Pageable pageable);

    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndIsReadFalse(UUID userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           update Notification n
              set n.isRead = true,
                  n.readAt = :readAt
            where n.id = :id
              and n.userId = :userId
              and n.isRead = false
           """)
    int markAsRead(@Param("id") UUID id, @Param("userId") UUID userId, @Param("readAt") OffsetDateTime readAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           update Notification n
              set n.isRead = true,
                  n.readAt = :readAt
            where n.userId = :userId
              and n.isRead = false
           """)
    int markAllAsRead(@Param("userId") UUID userId, @Param("readAt") OffsetDateTime readAt);

    int deleteByIdAndUserId(UUID id, UUID userId);
}
