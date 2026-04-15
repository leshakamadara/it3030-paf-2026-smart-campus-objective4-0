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

    private String resourceLocation;


    private MultipartFile imageFile;
    
    // allow multiple image files (max 3)
    private MultipartFile[] imageFiles;
}