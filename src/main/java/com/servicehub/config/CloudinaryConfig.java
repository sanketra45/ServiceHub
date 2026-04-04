package com.servicehub.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud_name:}")
    private String cloudName;

    @Value("${cloudinary.api_key:}")
    private String apiKey;

    @Value("${cloudinary.api_secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // If CLOUDINARY_URL is present in the environment (common on Render/Heroku), use it directly.
        String cloudinaryUrl = System.getenv("CLOUDINARY_URL");
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            return new Cloudinary(cloudinaryUrl);
        }

        // Fallback to individual parameters from environment or application.properties
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", getParam(cloudName, "CLOUDINARY_CLOUD_NAME"));
        config.put("api_key",    getParam(apiKey,    "CLOUDINARY_API_KEY"));
        config.put("api_secret", getParam(apiSecret, "CLOUDINARY_API_SECRET"));
        config.put("secure", "true"); // Recommended best practice

        return new Cloudinary(config);
    }

    private String getParam(String propValue, String envVar) {
        if (propValue != null && !propValue.isEmpty()) {
            return propValue;
        }
        return System.getenv(envVar);
    }
}
