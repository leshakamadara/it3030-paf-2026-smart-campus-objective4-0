package com.smartcampus.booking.repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    Optional<Booking> findByIdAndUserId(UUID id, UUID userId);

    Optional<Booking> findByQrCodeToken(String qrCodeToken);

    @Query("""
            select b
              from Booking b
             where (:status is null or b.status = :status)
               and (:resourceId is null or b.resourceId = :resourceId)
               and (:userId is null or b.userId = :userId)
               and (:fromTime is null or b.startTime >= :fromTime)
               and (:toTime is null or b.endTime <= :toTime)
            """)
    Page<Booking> search(
            @Param("status") BookingStatus status,
            @Param("resourceId") UUID resourceId,
            @Param("userId") UUID userId,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            Pageable pageable
    );
}
