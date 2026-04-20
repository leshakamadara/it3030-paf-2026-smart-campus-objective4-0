package com.smartcampus.ticket.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TicketUpdateNotAllowedException extends RuntimeException {
    public TicketUpdateNotAllowedException(String message) {
        super(message);
    }
}
