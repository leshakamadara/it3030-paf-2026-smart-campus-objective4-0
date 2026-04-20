package com.smartcampus.booking.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingCreateRequest(
        @NotNull UUID resourceId,
        @NotNull OffsetDateTime startTime,
        @NotNull OffsetDateTime endTime,
        @NotBlank String purpose,
        @Min(1) Integer attendeeCount
) {
}
