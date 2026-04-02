package com.servicehub.dto.request;

// THIS IS WHAT THE CUSTOMER SENDS WHEN CREATING A NEW BOOKING
// WHICH PROVIDER, DATE, TIME SLOT, AND THEIR ADDRESS

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class BookingRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String description;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or future") // 🔥 FIXED
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate bookingDate;

    @NotNull(message = "Time slot is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime timeSlot;

    @NotBlank(message = "Address is required")
    private String address;
}