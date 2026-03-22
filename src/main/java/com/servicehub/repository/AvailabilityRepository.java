package com.servicehub.repository;

// IT REPRESENTS TIME SLOTS OF A PROVIDER AND RETURNS ALL THE AVAILABLE TIME SLOTS

import com.servicehub.model.ProviderAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<ProviderAvailability, Long> {

    // All slots for a provider
    List<ProviderAvailability> findByProviderId(Long providerId);

    // Slots for a specific day
    List<ProviderAvailability> findByProviderIdAndDayOfWeek(Long providerId, DayOfWeek day);

    // Only open (not blocked) slots
    List<ProviderAvailability> findByProviderIdAndAvailableTrue(Long providerId);

    // Open slots on a specific day
    List<ProviderAvailability> findByProviderIdAndDayOfWeekAndAvailableTrue(
            Long providerId, DayOfWeek day);

    // Delete all slots for a provider (used when resetting schedule)
    void deleteByProviderId(Long providerId);
}
