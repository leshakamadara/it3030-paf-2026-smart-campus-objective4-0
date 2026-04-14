package com.smartcampus.ticket.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.smartcampus.ticket.model.Status;
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

    @PostMapping("/create")
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @ModelAttribute TicketRequestDTO request) {
        try {
            TicketResponseDTO response = ticketService.createTicket(request, "jane.smith@example.com");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id,@RequestParam Status status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, "admin@example.com"));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id,@RequestBody @NotBlank String comment) {
        return ResponseEntity.ok(ticketService.addComment(id, "guest@example.com", comment));
    }

    // ==================== ATTACHMENT MANAGEMENT ENDPOINTS ====================

    /**
     * Upload an image to a ticket
     * POST /api/tickets/{ticketId}/attachments/upload
     */
    @PostMapping("/{ticketId}/attachments/upload")
    public ResponseEntity<AttachmentDTO> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "guest@example.com") String userEmail) {
        try {
            AttachmentDTO attachment = ticketService.uploadAttachment(ticketId, file, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an attachment from a ticket
     * DELETE /api/tickets/attachments/{attachmentId}
     */
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Map<String, Object>> deleteAttachment(
            @PathVariable Long attachmentId,
            @RequestParam(defaultValue = "guest@example.com") String userEmail) {
        try {
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

    /**
     * Get ticket with all attachments
     * GET /api/tickets/{id}/with-attachments
     */
    @GetMapping("/{id}/with-attachments")
    public ResponseEntity<TicketResponseDTO> getTicketWithAttachments(@PathVariable Long id) {
        TicketResponseDTO ticket = ticketService.getTicketWithAttachments(id);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Delete a ticket and its attachments
     * DELETE /api/tickets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTicket(@PathVariable Long id,
                                                            @RequestParam(defaultValue = "guest@example.com") String userEmail) {
        boolean deleted = ticketService.deleteTicket(id, userEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("success", deleted);
        response.put("message", deleted ? "Ticket deleted successfully" : "Failed to delete ticket");
        return ResponseEntity.ok(response);
    }

    /**
     * Update a ticket's editable fields. Only allowed when ticket is OPEN.
     * PUT /api/tickets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @Valid @ModelAttribute TicketRequestDTO request,
                                          @RequestParam(defaultValue = "jane.smith@example.com") String userEmail) {
        try {
            TicketResponseDTO updated = ticketService.updateTicket(id, request, userEmail);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}

