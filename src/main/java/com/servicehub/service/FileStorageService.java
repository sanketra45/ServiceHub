package com.servicehub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    // --- Save file to Cloudinary and return its public secure URL ---
    public String storeFile(MultipartFile file, String subfolder) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            // Validate extension
            String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";

            if (!ext.matches("\\.(jpg|jpeg|png|webp|gif)")) {
                throw new RuntimeException("Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.");
            }

            // Upload directly to Cloudinary using subfolder as the cloud folder
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "servicehub/" + subfolder,
                    "public_id", UUID.randomUUID().toString(),
                    "resource_type", "image"
            ));

            // Return the public secure URL
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    // --- Delete a file by its URL ---
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty() || !fileUrl.contains("/upload/")) {
                return;
            }
            
            // Extract public_id: handles both with and without version string (e.g. v12345/)
            // URL: https://res.cloudinary.com/cloud/image/upload/v123/folder/id.jpg
            String partAfterUpload = fileUrl.substring(fileUrl.lastIndexOf("/upload/") + 8);
            
            // Remove version part if it exists (matches v[digits]/...)
            if (partAfterUpload.matches("v[0-9]+/.*")) {
                partAfterUpload = partAfterUpload.substring(partAfterUpload.indexOf("/") + 1);
            }
            
            // Remove extension
            String publicId = partAfterUpload.contains(".") 
                    ? partAfterUpload.substring(0, partAfterUpload.lastIndexOf(".")) 
                    : partAfterUpload;
            
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            System.out.println("Cloudinary delete result for " + publicId + ": " + result.get("result"));

        } catch (Exception e) {
            // Log but don't throw — deletion failure shouldn't break the user flow
            System.err.println("Could not delete file from Cloudinary: " + e.getMessage());
        }
    }
}
