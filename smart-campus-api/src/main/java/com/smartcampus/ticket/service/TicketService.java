package com.smartcampus.ticket.service;

import java.io.IOException;

import com.smartcampus.ticket.dto.CommentDTO;
import com.smartcampus.ticket.dto.TicketRequestDTO;
import com.smartcampus.ticket.dto.TicketResponseDTO;
import com.smartcampus.ticket.model.Status;

public interface TicketService {
    TicketResponseDTO createTicket(TicketRequestDTO request, String userEmail) throws IOException;
    TicketResponseDTO getTicketById(Long id);
    TicketResponseDTO updateTicketStatus(Long id, Status newStatus, String technicianEmail);
    CommentDTO addComment(Long ticketId, String userEmail, String commentText);
}
