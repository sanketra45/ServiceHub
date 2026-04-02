package com.servicehub.controller;

// IT HANDLES ALL THE APIS RELATED TO THE BOOKING SYSTEM

import com.servicehub.dto.request.BookingRequest;
import com.servicehub.dto.response.BookingResponse;
import com.servicehub.dto.response.ProviderResponse;
import com.servicehub.model.enums.BookingStatus;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.BookingService;
import com.servicehub.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final ProviderService providerService;

    // 🔥 CREATE BOOKING (CUSTOMER / PROVIDER)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'PROVIDER')") // ✅ FIX
    public ResponseEntity<BookingResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {

        Long userId = userDetails.getUser().getId();

        return ResponseEntity.ok(
                bookingService.createBooking(userId, request)
        );
    }

    // 🔥 CUSTOMER BOOKINGS
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('CUSTOMER')") // ✅ FIX
    public ResponseEntity<List<BookingResponse>> myBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();

        return ResponseEntity.ok(
                bookingService.getCustomerBookings(userId)
        );
    }

    // 🔥 PROVIDER BOOKINGS
    @GetMapping("/provider")
    @PreAuthorize("hasAuthority('PROVIDER')") // ✅ FIX (MAIN)
    public ResponseEntity<List<BookingResponse>> providerBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();

        return ResponseEntity.ok(
                bookingService.getProviderBookings(userId)
        );
    }

    // 🔥 GET BOOKING BY ID (PUBLIC / AUTH OPTIONAL)
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                bookingService.getById(id)
        );
    }

    // 🔥 UPDATE STATUS (CUSTOMER / PROVIDER)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('CUSTOMER','PROVIDER','ADMIN')") // ✅ FIX
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();

        String role = userDetails.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        return ResponseEntity.ok(
                bookingService.updateStatus(id, status, userId, role)
        );
    }

    // 🔥 EMERGENCY BOOKING (PUBLIC)
    @GetMapping("/emergency")
    public ResponseEntity<ProviderResponse> emergency(
            @RequestParam String serviceType,
            @RequestParam String city) {

        return ResponseEntity.ok(
                bookingService.emergencyBook(serviceType, city, providerService)
        );
    }
}