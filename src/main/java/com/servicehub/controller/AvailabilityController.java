package com.servicehub.controller;

// IT MANAGES PROVIDER WORKING SCHEDULES AND USERS SLOT VIEWING

import com.servicehub.dto.request.AvailabilityRequest;
import com.servicehub.dto.response.AvailabilityResponse;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    // POST /api/availability — Provider adds a new weekly slot
    // Body: { "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "17:00" }
    @PostMapping
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<AvailabilityResponse> addSlot(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.addSlot(user.getId(), request));
    }

    // GET /api/availability/{providerId} — Get all open slots for a provider
    @GetMapping("/{providerId}")
    public ResponseEntity<List<AvailabilityResponse>> getSlots(
            @PathVariable Long providerId) {
        return ResponseEntity.ok(availabilityService.getAvailableSlots(providerId));
    }

    // GET /api/availability/{providerId}/day?day=MONDAY
    // Get open slots for a specific day of the week
    @GetMapping("/{providerId}/day")
    public ResponseEntity<List<AvailabilityResponse>> getByDay(
            @PathVariable Long providerId,
            @RequestParam DayOfWeek day) {
        return ResponseEntity.ok(availabilityService.getSlotsByDay(providerId, day));
    }

    // GET /api/availability/{providerId}/free?date=2024-12-25
    // Get list of free 1-hour slots for a specific calendar date
    // This is what the booking UI calls when customer picks a date
    @GetMapping("/{providerId}/free")
    public ResponseEntity<List<LocalTime>> getFreeSlots(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(availabilityService.getFreeTimeSlotsForDate(providerId, date));
    }

    // PATCH /api/availability/{slotId}/toggle — Provider blocks/unblocks a slot
    @PatchMapping("/{slotId}/toggle")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<AvailabilityResponse> toggle(
            @PathVariable Long slotId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(availabilityService.toggleSlot(slotId, user.getId()));
    }

    // DELETE /api/availability/{slotId} — Provider permanently removes a slot
    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<Void> delete(
            @PathVariable Long slotId,
            @AuthenticationPrincipal CustomUserDetails user) {
        availabilityService.deleteSlot(slotId, user.getId());
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/availability/clear — Provider wipes their full schedule
    @DeleteMapping("/clear")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<Void> clearSchedule(@AuthenticationPrincipal CustomUserDetails user) {
        availabilityService.clearSchedule(user.getId());
        return ResponseEntity.noContent().build();
    }
}
