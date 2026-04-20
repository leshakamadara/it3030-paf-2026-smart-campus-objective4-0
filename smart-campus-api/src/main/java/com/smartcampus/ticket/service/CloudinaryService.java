package com.smartcampus.ticket.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    /**
     * Upload an image to Cloudinary
     * @param file the image file to upload
     * @param ticketId the ticket ID for folder organization
     * @return Map containing the uploaded image data (url, publicId, etc)
     */
    Map<String, Object> uploadImage(MultipartFile file, Long ticketId) throws IOException;

    /**
     * Delete an image from Cloudinary
     * @param publicId the Cloudinary public ID of the image
     * @return true if deletion was successful
     */
    boolean deleteImage(String publicId) throws IOException;
}
