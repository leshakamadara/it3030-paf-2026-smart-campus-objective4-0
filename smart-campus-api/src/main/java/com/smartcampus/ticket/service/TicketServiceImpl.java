package com.smartcampus.ticket.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartcampus.ticket.dto.CommentDTO;
import com.smartcampus.ticket.dto.TicketRequestDTO;
import com.smartcampus.ticket.dto.TicketResponseDTO;
import com.smartcampus.ticket.exception.TicketNotFoundException;
import com.smartcampus.ticket.exception.UserNotFoundException;
import com.smartcampus.ticket.model.Status;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketAttachment;
import com.smartcampus.ticket.model.TicketComment;
import com.smartcampus.ticket.model.User;
import com.smartcampus.ticket.repository.TicketAttachmentRepository;
import com.smartcampus.ticket.repository.TicketCommentRepository;
import com.smartcampus.ticket.repository.TicketRepository;
import com.smartcampus.ticket.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;


    

    @Override
    public TicketResponseDTO createTicket(TicketRequestDTO request, String userEmail) throws IOException {
        // Find existing user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found. Only existing users can create tickets."));

        // Create ticket entity
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(Status.OPEN);
        ticket.setCreatedBy(user);

       // Save ticket first 
        Ticket savedTicket = ticketRepository.save(ticket);

        // Handle attachment link
        if (request.getAttachmentLink() != null && !request.getAttachmentLink().trim().isEmpty()) {
            TicketAttachment attachment = new TicketAttachment();
            attachment.setLinkUrl(request.getAttachmentLink().trim());
            attachment.setTicket(savedTicket);
            attachmentRepository.save(attachment);
        }

        // Convert to DTO and return
        return convertToDTO(savedTicket);
    }

    @Override
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));
        return convertToDTO(ticket);
    }

    @Override
    public TicketResponseDTO updateTicketStatus(Long id, Status newStatus, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        // Find existing technician user
        User technician = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new UserNotFoundException("Technician with email " + technicianEmail + " not found. Only existing users can update ticket status."));

        ticket.setStatus(newStatus);
        ticket.setTechnician(technician);
        Ticket updatedTicket = ticketRepository.save(ticket);

        return convertToDTO(updatedTicket);
    }

    @Override
    public CommentDTO addComment(Long ticketId, String userEmail, String commentText) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        // Find existing user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found. Only existing users can add comments."));

        // Create comment
        TicketComment comment = new TicketComment();
        comment.setComment(commentText);
        comment.setTicket(ticket);
        comment.setCreatedBy(user);

        TicketComment savedComment = commentRepository.save(comment);
        return convertCommentToDTO(savedComment);
    }

    private TicketResponseDTO convertToDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setCreatedBy(ticket.getCreatedBy().getEmail());
        dto.setTechnician(ticket.getTechnician() != null ? ticket.getTechnician().getEmail() : null);

        // Convert attachment link
        String attachmentLink = ticket.getAttachments().isEmpty() ? null :
                ticket.getAttachments().get(0).getLinkUrl();
        dto.setAttachmentLink(attachmentLink);

        // Convert comments
        List<CommentDTO> comments = ticket.getComments().stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());
        dto.setComments(comments);

        return dto;
    }

    private CommentDTO convertCommentToDTO(TicketComment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getCreatedBy().getEmail(),
                comment.getComment(),
                comment.getCreatedAt()
        );
    }
}
