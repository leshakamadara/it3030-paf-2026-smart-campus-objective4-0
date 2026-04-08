package com.smartcampus.ticket.dto;

import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.ticket.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private MultipartFile[] attachments; // up to 3 files
}