package com.smartcampus.ticket.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.smartcampus.ticket.enums.Priority;
import com.smartcampus.ticket.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String category;
    private String description;
    private String resourceLocation;
    private Priority priority;
    private Status status;
    private String createdBy;
    private String contactName;

    private String technician;
    private String assignedToName;


    private List<AttachmentDTO> attachments;
    
    private List<CommentDTO> comments;
    private String resolutionNote;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}