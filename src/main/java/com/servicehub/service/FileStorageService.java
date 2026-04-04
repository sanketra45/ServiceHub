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
            // Validate extension
            String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";

            if (!ext.matches("\\.(jpg|jpeg|png|webp|gif)")) {
                throw new RuntimeException("Only image files are allowed (jpg, jpeg, png, webp, gif)");
            }

            // Upload directly to Cloudinary using subfolder as the cloud folder
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "servicehub/" + subfolder,
                    "public_id", UUID.randomUUID().toString()
            ));

            // Return the public secure URL
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file in Cloudinary: " + e.getMessage());
        }
    }

    // --- Delete a file by its URL ---
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) return;
            
            // Extract the public_id from the Cloudinary URL
            // Format: https://res.cloudinary.com/.../upload/v12345/servicehub/profiles/uuid.jpg
            int uploadIndex = fileUrl.indexOf("/upload/");
            if (uploadIndex == -1) return; // Not a standard Cloudinary URL
            
            String pathWithoutUpload = fileUrl.substring(uploadIndex + 8);
            // pathWithoutUpload = v12345/servicehub/profiles/uuid.jpg
            
            int firstSlashIndex = pathWithoutUpload.indexOf("/");
            if (firstSlashIndex == -1) return;
            
            String publicIdWithExtension = pathWithoutUpload.substring(firstSlashIndex + 1);
            // publicIdWithExtension = servicehub/profiles/uuid.jpg
            
            int lastDotIndex = publicIdWithExtension.lastIndexOf(".");
            String publicId = lastDotIndex != -1 
                    ? publicIdWithExtension.substring(0, lastDotIndex) 
                    : publicIdWithExtension;
            
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            // Log but don't throw — deletion failure shouldn't break the app
            System.err.println("Could not delete file from Cloudinary: " + e.getMessage());
        }
    }
}
