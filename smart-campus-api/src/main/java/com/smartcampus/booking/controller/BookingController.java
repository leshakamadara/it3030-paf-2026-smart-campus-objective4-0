package com.smartcampus.booking.controller;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingPageResponse;
import com.smartcampus.booking.dto.BookingQrVerificationResponse;
import com.smartcampus.booking.dto.BookingRejectRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
@Validated
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public BookingResponse createBooking(Authentication authentication, @Valid @RequestBody BookingCreateRequest request) {
        return bookingService.createBooking(authentication, request);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public BookingPageResponse getMyBookings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return bookingService.getMyBookings(authentication, page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public BookingResponse getBookingById(Authentication authentication, @PathVariable UUID id) {
        return bookingService.getBookingById(authentication, id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public BookingPageResponse getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) OffsetDateTime fromTime,
            @RequestParam(required = false) OffsetDateTime toTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return bookingService.getAllBookings(status, resourceId, userId, fromTime, toTime, page, size);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public BookingResponse approveBooking(Authentication authentication, @PathVariable UUID id) {
        return bookingService.approveBooking(authentication, id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public BookingResponse rejectBooking(Authentication authentication,
                                        @PathVariable UUID id,
                                        @Valid @RequestBody BookingRejectRequest request) {
        return bookingService.rejectBooking(authentication, id, request);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN','SUPER_ADMIN')")
    public BookingResponse cancelBooking(Authentication authentication, @PathVariable UUID id) {
        return bookingService.cancelBooking(authentication, id);
    }

    @GetMapping("/qr/{token}")
    @PreAuthorize("permitAll()")
    public BookingQrVerificationResponse verifyQrBooking(@PathVariable String token) {
        return bookingService.verifyBookingByQrToken(token);
    }
}
