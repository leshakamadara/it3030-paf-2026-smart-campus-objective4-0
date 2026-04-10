package com.smartcampus.ticket.dto;

import java.util.List;

import com.smartcampus.ticket.model.Priority;
import com.smartcampus.ticket.model.Status;
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
    private Priority priority;
    private Status status;
    private String createdBy;
    private String technician;
    private String attachmentLink;
    private List<CommentDTO> comments;
}