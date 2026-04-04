package com.servicehub.controller;

import com.servicehub.dto.request.ProviderRequest;
import com.servicehub.dto.response.ProviderResponse;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    // ✅ CREATE PROFILE
    @PostMapping("/profile")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<ProviderResponse> createProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProviderRequest request) {

        System.out.println("USER: " + userDetails);
        System.out.println("USER ID: " + userDetails.getId());

        return ResponseEntity.ok(
                providerService.createProfile(userDetails.getId(), request)
        );
    }

    // ✅ UPDATE PROFILE
    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<ProviderResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProviderRequest request) {

        return ResponseEntity.ok(
                providerService.updateProfile(userDetails.getId(), request)
        );
    }

    // ✅ GET MY PROFILE
    @GetMapping("/profile/me")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<ProviderResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                providerService.getMyProfile(userDetails.getId())
        );
    }

    // ✅ PUBLIC GET
    @GetMapping("/{id}")
    public ResponseEntity<ProviderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getById(id));
    }

    // ✅ SEARCH
    @GetMapping("/search")
    public ResponseEntity<List<ProviderResponse>> search(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sortBy) {

        return ResponseEntity.ok(
                providerService.search(serviceType, city, minRating, maxPrice, sortBy)
        );
    }

    // ✅ NEARBY
    @GetMapping("/nearby")
    public ResponseEntity<List<ProviderResponse>> nearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) Double radiusKm) {

        return ResponseEntity.ok(
                providerService.findNearby(lat, lng, radiusKm)
        );
    }

    // ✅ RECOMMENDED
    @GetMapping("/recommended")
    public ResponseEntity<List<ProviderResponse>> recommended(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String city) {

        return ResponseEntity.ok(
                providerService.getRecommended(serviceType, city)
        );
    }

    // ✅ ADMIN VERIFY
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProviderResponse> toggleVerify(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.toggleVerification(id));
    }

    // ✅ AI RECOMMEND
    @GetMapping("/ai-recommend")
    public ResponseEntity<List<ProviderResponse>> aiRecommend(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {

        return ResponseEntity.ok(
                providerService.getAIRecommendations(serviceType, city, lat, lng)
        );
    }
}