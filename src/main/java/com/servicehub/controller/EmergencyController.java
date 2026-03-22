package com.servicehub.controller;

// IT HANDELS ALL THE EMERGENCY REQUESTS COMMING FROM THE FRONTEND/ API

import com.servicehub.model.EmergencyRequest;
import com.servicehub.model.User;
import com.servicehub.service.EmergencyService;
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

    // POST /api/emergency
    // Customer triggers emergency — provider is auto-assigned immediately
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<EmergencyRequest> create(
            @AuthenticationPrincipal User user,
            @RequestParam String serviceType,
            @RequestParam String city,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(emergencyService.createEmergency(
                user.getId(), serviceType, city, description, address, lat, lng));
    }

    // GET /api/emergency/my — Customer's emergency history
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<EmergencyRequest>> myEmergencies(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                emergencyService.getCustomerEmergencies(user.getId()));
    }

    // GET /api/emergency/provider — Provider's assigned emergencies
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<EmergencyRequest>> providerEmergencies(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                emergencyService.getProviderEmergencies(user.getId()));
    }

    // GET /api/emergency/pending — Admin sees all active emergencies
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmergencyRequest>> pending() {
        return ResponseEntity.ok(emergencyService.getPendingEmergencies());
    }
}
