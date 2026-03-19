package com.servicehub.repository;

// IT MANAGES ALL BOOKING RELATED DATABASE OPERATIONS
// IT RETURNS ALL THE BOOKING DONE BY THE USERS

import com.servicehub.model.Booking;
import com.servicehub.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByProviderId(Long providerId);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByProviderIdAndStatus(Long providerId, BookingStatus status);

    // Check if a slot is already taken
    boolean existsByProviderIdAndBookingDateAndTimeSlot(
            Long providerId, LocalDate date, java.time.LocalTime timeSlot);
}
