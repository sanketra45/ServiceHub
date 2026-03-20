package com.servicehub.dto.request;

// THIS IS WHAT THE CUSTOMER SENDS WHEN CREATING A NEW BOOKING
// WHICH PROVIDER, DATE, TIME SLOT, AND THEIR ADDRESS

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String description;

    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Time slot is required")
    private LocalTime timeSlot;

    @NotBlank(message = "Address is required")
    private String address;
}
