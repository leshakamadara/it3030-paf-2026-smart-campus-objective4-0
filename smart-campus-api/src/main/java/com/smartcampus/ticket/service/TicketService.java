package com.smartcampus.ticket.service;

import java.io.IOException;
import java.util.List;

import com.smartcampus.ticket.dto.AttachmentDTO;
import com.smartcampus.ticket.dto.CommentDTO;
import com.smartcampus.ticket.dto.TicketRequestDTO;
import com.smartcampus.ticket.dto.TicketResponseDTO;
import com.smartcampus.ticket.model.Status;
import org.springframework.web.multipart.MultipartFile;

public interface TicketService {
    TicketResponseDTO createTicket(TicketRequestDTO request, String userEmail) throws IOException;
    TicketResponseDTO getTicketById(Long id);
    List<TicketResponseDTO> getAllTickets();
    TicketResponseDTO updateTicketStatus(Long id, Status newStatus, String technicianEmail);
    CommentDTO addComment(Long ticketId, String userEmail, String commentText);

    // Attachment management methods
    AttachmentDTO uploadAttachment(Long ticketId, MultipartFile file, String userEmail) throws IOException;
    boolean deleteAttachment(Long attachmentId, String userEmail) throws IOException;
    TicketResponseDTO getTicketWithAttachments(Long id);
    boolean deleteTicket(Long id, String userEmail);
    TicketResponseDTO updateTicket(Long id, TicketRequestDTO request, String userEmail) throws IOException;
}
