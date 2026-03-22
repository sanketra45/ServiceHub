package com.servicehub.service;

// IT HANDELS ALL THE LOGIC OF AVAILABILITY SERVICE
// Providers add slots, block them temporarily, or clear their entire schedule.
// Customers can check what slots are free before booking.

import com.servicehub.dto.request.AvailabilityRequest;
import com.servicehub.dto.response.AvailabilityResponse;
import com.servicehub.model.ProviderAvailability;
import com.servicehub.model.ServiceProvider;
import com.servicehub.repository.AvailabilityRepository;
import com.servicehub.repository.BookingRepository;
import com.servicehub.repository.ServiceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final ServiceProviderRepository providerRepository;
    private final BookingRepository bookingRepository;

    // --- Provider adds a new availability slot ---
    // Example: available every MONDAY from 09:00 to 17:00
    public AvailabilityResponse addSlot(Long userId, AvailabilityRequest request) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        ProviderAvailability slot = ProviderAvailability.builder()
                .provider(provider)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .available(true)
                .build();

        return mapToResponse(availabilityRepository.save(slot));
    }

    // --- Get all available slots for a provider ---
    public List<AvailabilityResponse> getAvailableSlots(Long providerId) {
        return availabilityRepository.findByProviderIdAndAvailableTrue(providerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Get open slots for a specific day ---
    public List<AvailabilityResponse> getSlotsByDay(Long providerId, DayOfWeek day) {
        return availabilityRepository.findByProviderIdAndDayOfWeekAndAvailableTrue(providerId, day)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Get free time slots for a specific date ---
    // Checks availability windows, then subtracts already-booked slots
    // Returns a list of 1-hour slot start times within open windows
    public List<LocalTime> getFreeTimeSlotsForDate(Long providerId, LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();

        // Get provider's availability windows for this day
        List<ProviderAvailability> windows = availabilityRepository
                .findByProviderIdAndDayOfWeekAndAvailableTrue(providerId, day);

        if (windows.isEmpty()) {
            return List.of(); // Provider doesn't work on this day
        }

        // Generate 1-hour slots within each window
        List<LocalTime> allSlots = new ArrayList<>();
        for (ProviderAvailability window : windows) {
            LocalTime current = window.getStartTime();
            while (current.plusHours(1).isBefore(window.getEndTime())
                    || current.plusHours(1).equals(window.getEndTime())) {
                allSlots.add(current);
                current = current.plusHours(1);
            }
        }

        // Remove already-booked slots for this date
        List<LocalTime> freeSlots = allSlots.stream()
                .filter(slot -> !bookingRepository
                        .existsByProviderIdAndBookingDateAndTimeSlot(providerId, date, slot))
                .collect(Collectors.toList());

        return freeSlots;
    }

    // --- Provider blocks a slot temporarily ---
    // Useful for holidays, personal leave etc.
    public AvailabilityResponse toggleSlot(Long slotId, Long userId) {
        ProviderAvailability slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Make sure only the owner can toggle their slot
        if (!slot.getProvider().getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only manage your own slots");
        }

        slot.setAvailable(!slot.isAvailable());
        return mapToResponse(availabilityRepository.save(slot));
    }

    // --- Provider removes a slot entirely ---
    public void deleteSlot(Long slotId, Long userId) {
        ProviderAvailability slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.getProvider().getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own slots");
        }

        availabilityRepository.delete(slot);
    }

    // --- Provider clears their entire schedule ---
    @Transactional
    public void clearSchedule(Long userId) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        availabilityRepository.deleteByProviderId(provider.getId());
    }

    // --- Helper: maps entity to response DTO ---
    private AvailabilityResponse mapToResponse(ProviderAvailability s) {
        return AvailabilityResponse.builder()
                .id(s.getId())
                .providerId(s.getProvider().getId())
                .providerName(s.getProvider().getUser().getName())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .available(s.isAvailable())
                .build();
    }
}
