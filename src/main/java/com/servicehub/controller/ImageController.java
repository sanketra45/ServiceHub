package com.servicehub.controller;

// THIS HANDLES ALL THE IMAGE UPLOAD RELATED REQUESTS AND APIS FROM THE FRONTEND

import com.servicehub.model.ServiceProvider;
import com.servicehub.repository.ServiceProviderRepository;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ServiceProvider provider = providerRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        // Delete old photo if exists
        if (provider.getPhotoUrl() != null && !provider.getPhotoUrl().isEmpty()) {
            fileStorageService.deleteFile(provider.getPhotoUrl());
        }

        String url = fileStorageService.storeFile(file, "profiles");
        provider.setPhotoUrl(url);
        providerRepository.save(provider);

        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/work")
    public ResponseEntity<Map<String, String>> uploadWorkImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ServiceProvider provider = providerRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        String url = fileStorageService.storeFile(file, "work");
        provider.getWorkImages().add(url);
        providerRepository.save(provider);

        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteImage(
            @RequestParam String fileUrl,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
}