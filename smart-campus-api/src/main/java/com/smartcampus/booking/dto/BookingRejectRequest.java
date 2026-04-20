package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingRejectRequest(@NotBlank String reason) {
}
