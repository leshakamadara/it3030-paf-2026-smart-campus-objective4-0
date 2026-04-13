package com.smartcampus.ticket.config;

import com.cloudinary.Cloudinary;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "cloudinary")
@Data
public class CloudinaryConfig {

    private String cloudName;
    private String apiKey;
    private String apiSecret;
    private String folder;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(com.cloudinary.utils.ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}
