package com.servicehub.controller;

// IT HANDELS ALL THE EMERGENCY REQUESTS COMMING FROM THE FRONTEND/ API

import com.servicehub.model.EmergencyRequest;
import com.servicehub.model.User;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.EmergencyService;
import com.servicehub.service.ProviderService; // ✅ ADD THIS
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;
    private final ProviderService providerService; // ✅ ADD THIS

    // POST /api/emergency
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<EmergencyRequest> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String serviceType,
            @RequestParam String city,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {

        User user = userDetails.getUser();

        return ResponseEntity.ok(emergencyService.createEmergency(
                user.getId(), serviceType, city, description, address, lat, lng));
    }

    // GET /api/emergency/my
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<EmergencyRequest>> myEmergencies(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();

        return ResponseEntity.ok(
                emergencyService.getCustomerEmergencies(user.getId()));
    }

    // GET /api/emergency/provider
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<EmergencyRequest>> providerEmergencies(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();

        Long providerId = providerService
                .getByUserId(user.getId())
                .getId();

        return ResponseEntity.ok(
                emergencyService.getProviderEmergencies(providerId));
    }

    // GET /api/emergency/pending
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmergencyRequest>> pending() {
        return ResponseEntity.ok(emergencyService.getPendingEmergencies());
    }
}