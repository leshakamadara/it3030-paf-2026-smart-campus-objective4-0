package com.smartcampus.booking.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;

public record BookingResponse(
        UUID id,
        Long resourceId,
        String resourceName,
        UUID userId,
        String userName,
        BookingStatus status,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        String purpose,
        Integer attendeeCount,
        UUID reviewedBy,
        String reviewReason,
        OffsetDateTime reviewedAt,
        String qrCodeToken,
        String qrCodeImageBase64,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        UUID createdBy,
        UUID updatedBy
) {

    public static BookingResponse from(Booking booking, String resourceName, String userName, String qrCodeImageBase64) {
        return new BookingResponse(
                booking.getId(),
                booking.getResourceId(),
                resourceName,
                booking.getUserId(),
                userName,
                booking.getStatus(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getAttendeeCount(),
                booking.getReviewedBy(),
                booking.getReviewReason(),
                booking.getReviewedAt(),
                booking.getQrCodeToken(),
                qrCodeImageBase64,
                booking.getCreatedAt(),
                booking.getUpdatedAt(),
                booking.getCreatedBy(),
                booking.getUpdatedBy()
        );
    }
}
