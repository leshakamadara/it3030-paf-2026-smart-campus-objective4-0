package com.smartcampus.ticket.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String createdBy;
    private String createdByName;
    private String createdByRole;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}