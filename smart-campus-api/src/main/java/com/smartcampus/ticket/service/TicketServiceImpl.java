package com.smartcampus.ticket.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.ticket.dto.AttachmentDTO;
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
    private final CloudinaryService cloudinaryService;

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
        ticket.setResourceLocation(request.getResourceLocation());

        ticket.setPriority(request.getPriority());
        ticket.setStatus(Status.OPEN);
        ticket.setCreatedBy(user);

        // Save ticket first 
        Ticket savedTicket = ticketRepository.save(ticket);

        // Handle Cloudinary image upload
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            uploadAttachmentInternal(savedTicket, request.getImageFile());
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
    public TicketResponseDTO getTicketWithAttachments(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));
        return convertToDTO(ticket);
    }

    @Override
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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

    @Override
    public AttachmentDTO uploadAttachment(Long ticketId, MultipartFile file, String userEmail) throws IOException {
        // Verify user exists
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found."));

        // Get ticket
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        // Upload to Cloudinary and save to database
        return uploadAttachmentInternal(ticket, file);
    }

    @Override
    public boolean deleteAttachment(Long attachmentId, String userEmail) throws IOException {
        // Verify user exists
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found."));

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new TicketNotFoundException("Attachment not found"));

        // Delete from Cloudinary if it has a public ID
        if (attachment.getCloudinaryPublicId() != null) {
            cloudinaryService.deleteImage(attachment.getCloudinaryPublicId());
        }

        // Delete from database
        attachmentRepository.delete(attachment);
        return true;
    }

    @Override
    public boolean deleteTicket(Long id, String userEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        // Optionally verify user permission here; currently allow deletion if user exists
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found."));

        // Delete attachments from Cloudinary
        for (TicketAttachment att : ticket.getAttachments()) {
            if (att.getCloudinaryPublicId() != null) {
                try {
                    cloudinaryService.deleteImage(att.getCloudinaryPublicId());
                } catch (IOException e) {
                    // log and continue
                }
            }
        }

        ticketRepository.delete(ticket);
        return true;
    }

    @Override
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO request, String userEmail) throws IOException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        // Verify user exists (caller)
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + userEmail + " not found."));

        // Only allow updates when ticket is OPEN
        if (ticket.getStatus() != Status.OPEN) {
            throw new com.smartcampus.ticket.exception.TicketUpdateNotAllowedException("Only tickets in OPEN state can be updated.");
        }

        // Update editable fields (only those provided)
        if (request.getTitle() != null) ticket.setTitle(request.getTitle());
        if (request.getCategory() != null) ticket.setCategory(request.getCategory());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());
        if (request.getResourceLocation() != null) ticket.setResourceLocation(request.getResourceLocation());

        Ticket updated = ticketRepository.save(ticket);

        // If image provided, attach it (add as attachment)
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            uploadAttachmentInternal(updated, request.getImageFile());
        }

        return convertToDTO(updated);
    }

    private AttachmentDTO uploadAttachmentInternal(Ticket ticket, MultipartFile file) throws IOException {
        Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, ticket.getId());

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setCloudinaryPublicId((String) uploadResult.get("public_id"));
        attachment.setCloudinaryUrl((String) uploadResult.get("url"));
        attachment.setCloudinarySecureUrl((String) uploadResult.get("secure_url"));
        // Handle bytes as Number to avoid ClassCastException when Cloudinary returns Integer
        Object bytesObj = uploadResult.get("bytes");
        if (bytesObj instanceof Number) {
            attachment.setCloudinarySize(((Number) bytesObj).longValue());
        }
        attachment.setCloudinaryResourceType((String) uploadResult.get("resource_type"));
        // Handle version as Number since Cloudinary may return Integer; convert to Long
        Object versionObj = uploadResult.get("version");
        if (versionObj instanceof Number) {
            attachment.setCloudinaryVersion(((Number) versionObj).longValue());
        }

        TicketAttachment savedAttachment = attachmentRepository.save(attachment);
        return convertAttachmentToDTO(savedAttachment);
    }

    private TicketResponseDTO convertToDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setResourceLocation(ticket.getResourceLocation());

        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setCreatedBy(ticket.getCreatedBy().getEmail());
        dto.setTechnician(ticket.getTechnician() != null ? ticket.getTechnician().getEmail() : null);

        // Convert attachments
        List<AttachmentDTO> attachmentDTOs = ticket.getAttachments().stream()
                .map(this::convertAttachmentToDTO)
                .collect(Collectors.toList());
        dto.setAttachments(attachmentDTOs);

        // Convert comments
        List<CommentDTO> comments = ticket.getComments().stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());
        dto.setComments(comments);

        return dto;
    }

    private AttachmentDTO convertAttachmentToDTO(TicketAttachment attachment) {
        return new AttachmentDTO(
                attachment.getId(),
                attachment.getLinkUrl(),
                attachment.getCloudinaryPublicId(),
                attachment.getCloudinaryUrl(),
                attachment.getCloudinarySecureUrl(),
                attachment.getCloudinarySize(),
                attachment.getCloudinaryResourceType(),
                attachment.getCloudinaryVersion(),
                attachment.getCreatedAt()
        );
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
