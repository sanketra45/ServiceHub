package com.servicehub.controller;

// THIS HANDELS ALL THE IMAGE UPLOAD RELATED REQUESTS AND APIS FROM THE FRONTEND

import com.servicehub.model.ServiceProvider;
import com.servicehub.model.User;
import com.servicehub.repository.ServiceProviderRepository;
import com.servicehub.security.CustomUserDetails;
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

    @PostMapping("/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String url = fileStorageService.storeFile(file, "profiles");
        
        // Update provider entity
        ServiceProvider provider = providerRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        
        // Delete old photo if exists
        if (provider.getPhotoUrl() != null && !provider.getPhotoUrl().isEmpty()) {
            fileStorageService.deleteFile(provider.getPhotoUrl());
        }

        provider.setPhotoUrl(url);
        providerRepository.save(provider);
        
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/work")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Map<String, String>> uploadWorkImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String url = fileStorageService.storeFile(file, "work");
        
        ServiceProvider provider = providerRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        
        provider.getWorkImages().add(url);
        providerRepository.save(provider);
        
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @RequestParam String fileUrl) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
}