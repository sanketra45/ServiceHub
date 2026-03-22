package com.servicehub.service;

// This handles saving uploaded files to disk, generating unique filenames to avoid collisions,
// and serving the public URL back.

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    // --- Save file to disk and return its public URL ---
    // Generates a UUID filename so two uploads of "photo.jpg"
    // never overwrite each other
    public String storeFile(MultipartFile file, String subfolder) {
        try {
            // Validate extension — only allow images
            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename());
            String ext = originalName.substring(
                    originalName.lastIndexOf(".")).toLowerCase();

            if (!ext.matches("\\.(jpg|jpeg|png|webp|gif)")) {
                throw new RuntimeException(
                        "Only image files are allowed (jpg, jpeg, png, webp, gif)");
            }

            // Build target folder path
            Path targetDir = Paths.get(uploadDir + subfolder).toAbsolutePath();
            Files.createDirectories(targetDir);

            // Generate unique filename
            String newFilename = UUID.randomUUID() + ext;
            Path targetPath = targetDir.resolve(newFilename);

            Files.copy(file.getInputStream(), targetPath,
                    StandardCopyOption.REPLACE_EXISTING);

            // Return the public URL path (served by Spring Boot)
            return "/uploads/" + subfolder + "/" + newFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }

    // --- Delete a file by its URL path ---
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) return;
            // Convert URL back to filesystem path
            String relativePath = fileUrl.replace("/uploads/", uploadDir);
            Path filePath = Paths.get(relativePath).toAbsolutePath();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't throw — deletion failure shouldn't break the app
            System.err.println("Could not delete file: " + e.getMessage());
        }
    }
}
