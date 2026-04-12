package com.smartcampus.ticket.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {
    private Long id;
    private String linkUrl;
    private String cloudinaryPublicId;
    private String cloudinaryUrl;
    private String cloudinarySecureUrl;
    private Long cloudinarySize;
    private String cloudinaryResourceType;
    private LocalDateTime createdAt;
}
