package com.smartcampus.ticket.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.ticket.dto.AttachmentDTO;
import com.smartcampus.ticket.dto.CommentDTO;
import com.smartcampus.ticket.dto.TicketRequestDTO;
import com.smartcampus.ticket.dto.TicketResponseDTO;
import com.smartcampus.ticket.enums.Status;
import com.smartcampus.ticket.service.TicketService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    @PostMapping("/create")
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @ModelAttribute TicketRequestDTO request) {
        try {
            String userEmail = getCurrentUserEmail();
            TicketResponseDTO response = ticketService.createTicket(request, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException iae) {
            Map<String,Object> resp = new HashMap<>();
            resp.put("error", iae.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (IOException e)  {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id,@RequestParam Status status, @RequestParam(required = false) String notes) {
        String userEmail = getCurrentUserEmail();
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, userEmail, notes));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TicketResponseDTO> assignTechnician(@PathVariable Long id, @RequestParam String technicianEmail) {
        String userEmail = getCurrentUserEmail();
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianEmail, userEmail));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id,@RequestBody @NotBlank String comment) {
        String userEmail = getCurrentUserEmail();
        return ResponseEntity.ok(ticketService.addComment(id, userEmail, comment));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<CommentDTO> editComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestBody @NotBlank String comment) {
        String userEmail = getCurrentUserEmail();
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, userEmail, comment));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {
        String userEmail = getCurrentUserEmail();
        boolean deleted = ticketService.deleteComment(ticketId, commentId, userEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("success", deleted);
        response.put("message", deleted ? "Comment deleted successfully" : "Comment not found or not deleted");
        return ResponseEntity.ok(response);
    }

    // ATTACHMENT MANAGEMENT ENDPOINTS 

    /*
      Upload an image related to a ticket (upload in cloudinary  and add that related data in db)
     */

    @PostMapping("/{ticketId}/attachments/upload")
    public ResponseEntity<AttachmentDTO> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) {
        try {
            String userEmail = getCurrentUserEmail();
            AttachmentDTO attachment = ticketService.uploadAttachment(ticketId, file, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     Delete an attachment from a ticket
     */
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Map<String, Object>> deleteAttachment(
            @PathVariable Long attachmentId) {
        try {
            String userEmail = getCurrentUserEmail();
            boolean deleted = ticketService.deleteAttachment(attachmentId, userEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("success", deleted);
            response.put("message", deleted ? "Attachment deleted successfully" : "Failed to delete attachment");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting attachment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /* Get ticket with all attachments */
    @GetMapping("/{id}/with-attachments")
    public ResponseEntity<TicketResponseDTO> getTicketWithAttachments(@PathVariable Long id) {
        TicketResponseDTO ticket = ticketService.getTicketWithAttachments(id);
        return ResponseEntity.ok(ticket);
    }

    /*Delete a ticket and its attachments */

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTicket(@PathVariable Long id) {
        String userEmail = getCurrentUserEmail();
        boolean deleted = ticketService.deleteTicket(id, userEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("success", deleted);
        response.put("message", deleted ? "Ticket deleted successfully" : "Failed to delete ticket");
        return ResponseEntity.ok(response);
    }

    /* Update a ticket's editable fields. Only allowed when ticket is OPEN state only.*/
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @Valid @ModelAttribute TicketRequestDTO request) {
        try {
            String userEmail = getCurrentUserEmail();
            TicketResponseDTO updated = ticketService.updateTicket(id, request, userEmail);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", iae.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}

