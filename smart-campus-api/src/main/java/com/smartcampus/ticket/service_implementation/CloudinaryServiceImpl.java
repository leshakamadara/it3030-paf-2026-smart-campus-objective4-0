package com.smartcampus.ticket.service_implementation;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smartcampus.ticket.service.CloudinaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:smart-campus-tickets}")
    private String baseFolder;

    @Override
    public Map<String, Object> uploadImage(MultipartFile file, Long ticketId) throws IOException {
        try {
            String folder = baseFolder + "/ticket-" + ticketId;

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadParams = (Map<String, Object>) ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "public_id", System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), uploadParams);

            log.info("Image successfully uploaded to Cloudinary. Public ID: {}", uploadResult.get("public_id"));

            return uploadResult;
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary", e);
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public boolean deleteImage(String publicId) throws IOException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> deleteResult = (Map<String, Object>) cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            boolean isDeleted = "ok".equals(deleteResult.get("result"));

            if (isDeleted) {
                log.info("Image successfully deleted from Cloudinary. Public ID: {}", publicId);
            } else {
                log.warn("Could not delete image from Cloudinary. Public ID: {}", publicId);
            }

            return isDeleted;
        } catch (IOException e) {
            log.error("Error deleting image from Cloudinary. Public ID: {}", publicId, e);
            throw new IOException("Failed to delete image from Cloudinary", e);
        }
    }
}
