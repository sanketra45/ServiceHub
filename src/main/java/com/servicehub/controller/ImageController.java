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
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails userDetails, // ✅
            @RequestParam("file") MultipartFile file) {

        ServiceProvider provider = providerRepository.findByUserId(userDetails.getUser().getId()) // ✅
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        if (provider.getPhotoUrl() != null) {
            fileStorageService.deleteFile(provider.getPhotoUrl());
        }

        String url = fileStorageService.storeFile(file, "profiles");
        provider.setPhotoUrl(url);
        providerRepository.save(provider);

        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/work")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<Map<String, String>> uploadWorkImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file) {

        ServiceProvider provider = providerRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        String url = fileStorageService.storeFile(file, "work");
        provider.getWorkImages().add(url); // ✅ persist to DB
        providerRepository.save(provider);

        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('PROVIDER') or hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @RequestParam String fileUrl) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
}