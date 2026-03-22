package com.servicehub.controller;

// IT HANDELS ALL THE APIS RELATED TO PROVIDER SERVICES
// IT HANDELS HTTP REQUESTS AND CONNECTS FRONTEND WITH THE SERVICE LAYER

import com.servicehub.dto.request.ProviderRequest;
import com.servicehub.dto.response.ProviderResponse;
import com.servicehub.model.User;
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

    // POST /api/providers/profile — Provider creates their profile
    @PostMapping("/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderResponse> createProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProviderRequest request) {
        return ResponseEntity.ok(providerService.createProfile(user.getId(), request));
    }

    // PUT /api/providers/profile — Provider updates their profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProviderRequest request) {
        return ResponseEntity.ok(providerService.updateProfile(user.getId(), request));
    }

    // GET /api/providers/profile/me — Provider views their own profile
    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderResponse> getMyProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(providerService.getMyProfile(user.getId()));
    }

    // GET /api/providers/{id} — Anyone can view a provider's public profile
    @GetMapping("/{id}")
    public ResponseEntity<ProviderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getById(id));
    }

    // GET /api/providers/search?serviceType=Electrician&city=Mumbai&minRating=4&maxPrice=500&sortBy=rating
    // Public search with optional filters — all params are optional
    @GetMapping("/search")
    public ResponseEntity<List<ProviderResponse>> search(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(
                providerService.search(serviceType, city, minRating, maxPrice, sortBy));
    }

    // GET /api/providers/nearby?lat=19.07&lng=72.87&radiusKm=10
    // Returns providers within a radius of given coordinates
    @GetMapping("/nearby")
    public ResponseEntity<List<ProviderResponse>> nearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(providerService.findNearby(lat, lng, radiusKm));
    }

    // GET /api/providers/recommended?serviceType=Plumber&city=Delhi
    // Returns AI-scored top 10 providers
    @GetMapping("/recommended")
    public ResponseEntity<List<ProviderResponse>> recommended(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(providerService.getRecommended(serviceType, city));
    }

    // PATCH /api/providers/{id}/verify — Admin toggles verified badge
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProviderResponse> toggleVerify(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.toggleVerification(id));
    }

    // GET /api/providers/ai-recommend
    @GetMapping("/ai-recommend")
    public ResponseEntity<List<ProviderResponse>> aiRecommend(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(
                providerService.getAIRecommendations(serviceType, city, lat, lng));
    }
}
