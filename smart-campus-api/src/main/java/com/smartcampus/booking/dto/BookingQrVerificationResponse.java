package com.smartcampus.booking.dto;

public record BookingQrVerificationResponse(
        boolean valid,
        String message,
        BookingResponse booking
) {
}
