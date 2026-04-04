package com.servicehub.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Obsolete uploads mapping removed
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 🔥 CHANGE HERE
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}