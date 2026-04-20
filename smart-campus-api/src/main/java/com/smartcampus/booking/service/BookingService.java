package com.smartcampus.booking.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingPageResponse;
import com.smartcampus.booking.dto.BookingQrVerificationResponse;
import com.smartcampus.booking.dto.BookingRejectRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.exception.ConflictException;
import com.smartcampus.booking.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ConflictCheckService conflictCheckService;
    private final CurrentBookingUserService currentBookingUserService;
    private final QrCodeService qrCodeService;

    public BookingService(
            BookingRepository bookingRepository,
            ConflictCheckService conflictCheckService,
            CurrentBookingUserService currentBookingUserService,
            QrCodeService qrCodeService
    ) {
        this.bookingRepository = bookingRepository;
        this.conflictCheckService = conflictCheckService;
        this.currentBookingUserService = currentBookingUserService;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public BookingResponse createBooking(org.springframework.security.core.Authentication authentication,
                                         BookingCreateRequest request) {
        validateTimeRange(request.startTime(), request.endTime());
        conflictCheckService.assertNoConflict(request.resourceId(), request.startTime(), request.endTime());

        UUID currentUserId = currentBookingUserService.resolveUserId(authentication);

        Booking booking = new Booking();
        booking.setResourceId(request.resourceId());
        booking.setUserId(currentUserId);
        booking.setStatus(BookingStatus.PENDING);
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose().trim());
        booking.setAttendeeCount(request.attendeeCount());
        booking.setCreatedBy(currentUserId);
        booking.setUpdatedBy(currentUserId);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public BookingPageResponse getMyBookings(org.springframework.security.core.Authentication authentication,
                                             int page,
                                             int size) {
        UUID currentUserId = currentBookingUserService.resolveUserId(authentication);
        Pageable pageable = createPageable(page, size);
        Page<Booking> bookingPage = bookingRepository.findByUserId(currentUserId, pageable);
        return toPageResponse(bookingPage, false);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(org.springframework.security.core.Authentication authentication, UUID bookingId) {
        UUID currentUserId = currentBookingUserService.resolveUserId(authentication);
        boolean admin = currentBookingUserService.isAdmin(authentication);

        Booking booking = admin
                ? bookingRepository.findById(bookingId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"))
                : bookingRepository.findByIdAndUserId(bookingId, currentUserId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        return toResponse(booking, booking.getStatus() == BookingStatus.APPROVED && booking.getQrCodeToken() != null);
    }

    @Transactional(readOnly = true)
    public BookingPageResponse getAllBookings(
            BookingStatus status,
            UUID resourceId,
            UUID userId,
            OffsetDateTime fromTime,
            OffsetDateTime toTime,
            int page,
            int size
    ) {
        Pageable pageable = createPageable(page, size);
        Page<Booking> bookingPage = bookingRepository.search(status, resourceId, userId, fromTime, toTime, pageable);
        return toPageResponse(bookingPage, false);
    }

    @Transactional
    public BookingResponse approveBooking(org.springframework.security.core.Authentication authentication, UUID bookingId) {
        UUID adminId = currentBookingUserService.resolveUserId(authentication);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(OffsetDateTime.now());
        booking.setReviewReason(null);
        booking.setUpdatedBy(adminId);
        if (booking.getQrCodeToken() == null) {
            booking.setQrCodeToken(qrCodeService.generateToken());
        }

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved, true);
    }

    @Transactional
    public BookingResponse rejectBooking(org.springframework.security.core.Authentication authentication,
                                         UUID bookingId,
                                         BookingRejectRequest request) {
        UUID adminId = currentBookingUserService.resolveUserId(authentication);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(OffsetDateTime.now());
        booking.setReviewReason(request.reason().trim());
        booking.setUpdatedBy(adminId);
        booking.setQrCodeToken(null);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved, false);
    }

    @Transactional
    public BookingResponse cancelBooking(org.springframework.security.core.Authentication authentication, UUID bookingId) {
        UUID currentUserId = currentBookingUserService.resolveUserId(authentication);
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedBy(currentUserId);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public BookingQrVerificationResponse verifyBookingByQrToken(String token) {
        Booking booking = bookingRepository.findByQrCodeToken(token).orElse(null);
        if (booking == null) {
            return new BookingQrVerificationResponse(false, "Invalid QR token", null);
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            return new BookingQrVerificationResponse(false, "Booking is not active for check-in", toResponse(booking, false));
        }

        return new BookingQrVerificationResponse(true, "QR token is valid", toResponse(booking, true));
    }

    private void validateTimeRange(OffsetDateTime startTime, OffsetDateTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }
    }

    private Pageable createPageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private BookingPageResponse toPageResponse(Page<Booking> bookingPage, boolean includeQrImage) {
        return new BookingPageResponse(
                bookingPage.getContent().stream().map(booking -> toResponse(booking, includeQrImage)).toList(),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements(),
                bookingPage.getTotalPages(),
                bookingPage.isLast()
        );
    }

    private BookingResponse toResponse(Booking booking, boolean includeQrImage) {
        String qrImage = null;
        if (includeQrImage && booking.getQrCodeToken() != null) {
            qrImage = qrCodeService.generateQrPngBase64(booking.getQrCodeToken());
        }
        return BookingResponse.from(booking, qrImage);
    }
}
