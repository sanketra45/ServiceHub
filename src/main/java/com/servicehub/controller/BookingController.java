package com.servicehub.controller;

// IT HANDELS ALL THE APIS RELATED TO THE BOOKING SYSTEM

import com.servicehub.dto.request.BookingRequest;
import com.servicehub.dto.response.BookingResponse;
import com.servicehub.dto.response.ProviderResponse;
import com.servicehub.model.User;
import com.servicehub.model.enums.BookingStatus;
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

    // POST /api/bookings — Customer creates a booking
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(user.getId(), request));
    }

    // GET /api/bookings/my — Customer sees their own booking history
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BookingResponse>> myBookings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getCustomerBookings(user.getId()));
    }

    // GET /api/bookings/provider — Provider sees bookings assigned to them
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<BookingResponse>> providerBookings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getProviderBookings(user.getId()));
    }

    // GET /api/bookings/{id} — Get a single booking (customer, provider, or admin)
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    // PATCH /api/bookings/{id}/status?status=ACCEPTED
    // Provider moves status forward; Customer can cancel
    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @AuthenticationPrincipal User user) {
        String role = user.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(
                bookingService.updateStatus(id, status, user.getId(), role));
    }

    // GET /api/bookings/emergency?serviceType=Electrician&city=Mumbai
    // Returns the best available verified provider immediately
    @GetMapping("/emergency")
    public ResponseEntity<ProviderResponse> emergency(
            @RequestParam String serviceType,
            @RequestParam String city) {
        return ResponseEntity.ok(
                bookingService.emergencyBook(serviceType, city, providerService));
    }
}
