package com.servicehub.controller;

// THIS HANDELS ALL THE IMAGE UPLOAD RELATED REQUESTS AND APIS FROM THE FRONTEND

import com.servicehub.model.ServiceProvider;
import com.servicehub.model.User;
import com.servicehub.repository.ServiceProviderRepository;
import com.servicehub.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final FileStorageService fileStorageService;
    private final ServiceProviderRepository providerRepository;

    // POST /api/images/profile — Provider uploads their profile photo
    // Returns the public URL of the saved image
    @PostMapping("/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {

        ServiceProvider provider = providerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        // Delete old photo if it exists
        if (provider.getPhotoUrl() != null) {
            fileStorageService.deleteFile(provider.getPhotoUrl());
        }

        String url = fileStorageService.storeFile(file, "profiles");
        provider.setPhotoUrl(url);
        providerRepository.save(provider);

        return ResponseEntity.ok(Map.of("url", url));
    }

    // POST /api/images/work — Provider uploads before/after work images
    // Stored separately from profile photos in the 'work' subfolder
    @PostMapping("/work")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Map<String, String>> uploadWorkImage(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {

        // Verify provider exists
        providerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        String url = fileStorageService.storeFile(file, "work");
        return ResponseEntity.ok(Map.of("url", url));
    }

    // DELETE /api/images — Delete a specific image by URL
    @DeleteMapping
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @RequestParam String fileUrl) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
}
