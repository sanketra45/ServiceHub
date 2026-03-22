package com.servicehub.config;

// IT SERVES THE UPLOAD FOLDER AS STATIC RESOURCE
// Without this, uploaded images won't be accessible via the browser
// even though they're saved on disk.

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    // Maps /uploads/** URL to the actual folder on disk
    // So http://localhost:8080/uploads/profiles/abc.jpg works
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" +
                        java.nio.file.Paths.get(uploadDir)
                                .toAbsolutePath() + "/");
    }

    // Allow React (localhost:5173) to call the Spring Boot API
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
