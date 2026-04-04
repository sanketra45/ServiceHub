package com.servicehub.controller;

// IT HANDELS ALL THE APIS RELATED TO THE ADMIN

import com.servicehub.dto.response.*;
import com.servicehub.service.AdminService;
import com.servicehub.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Applied to entire controller — all endpoints need ADMIN
public class AdminController {

    private final AdminService adminService;
    private final ProviderService providerService;

    // GET /api/admin/stats — Dashboard summary cards
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // GET /api/admin/users — Full user list
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // PATCH /api/admin/users/{id}/toggle — Enable or disable a user
    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<AdminUserResponse> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    // DELETE /api/admin/users/{id} — Permanently delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/admin/providers — All providers
    @GetMapping("/providers")
    public ResponseEntity<List<ProviderResponse>> getAllProviders() {
        return ResponseEntity.ok(adminService.getAllProviders());
    }

    // GET /api/admin/providers/pending — Unverified providers awaiting approval
    @GetMapping("/providers/pending")
    public ResponseEntity<List<ProviderResponse>> getPendingProviders() {
        return ResponseEntity.ok(adminService.getPendingProviders());
    }

    // PATCH /api/admin/providers/{id}/verify — Approve or revoke a provider
    @PatchMapping("/providers/{id}/verify")
    public ResponseEntity<ProviderResponse> verifyProvider(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.toggleVerification(id));
    }

    // GET /api/admin/bookings — All bookings platform-wide
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    // DELETE /api/admin/reviews/{id} — Remove a fake or abusive review
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        adminService.removeReview(id);
        return ResponseEntity.noContent().build();
    }
}
