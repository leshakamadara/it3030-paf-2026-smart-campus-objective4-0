package com.smartcampus.booking.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.resource.entity.Resource;

public record BookingQrVerificationResponse(
        boolean valid,
        String message,
        BookingVerificationDetails booking
) {
    public record BookingVerificationDetails(
            UUID id,
            Long resourceId,
            String resourceName,
            String resourceCode,
            String resourceType,
            String building,
            Integer capacity,
            UUID userId,
            String userName,
            BookingStatus status,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            String purpose,
            Integer attendeeCount
    ) {
        public static BookingVerificationDetails from(Booking booking, Resource resource, String userName) {
            return new BookingVerificationDetails(
                    booking.getId(),
                    booking.getResourceId(),
                    resource != null ? resource.getName() : "Unknown Resource",
                    resource != null ? resource.getResourceCode() : null,
                    resource != null && resource.getType() != null ? resource.getType().name() : null,
                    resource != null ? resource.getBuilding() : null,
                    resource != null ? resource.getCapacity() : null,
                    booking.getUserId(),
                    userName,
                    booking.getStatus(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getPurpose(),
                    booking.getAttendeeCount()
            );
        }
    }
}
