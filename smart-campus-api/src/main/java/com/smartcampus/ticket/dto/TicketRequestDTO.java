package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {
    @NotBlank
    private String title;

    private String category;

    @NotBlank
    private String description;

    @NotNull
    private Priority priority;

    // Legacy field - for backward compatibility
    private String attachmentLink;

    // New field - for Cloudinary image upload
    private MultipartFile imageFile;
}