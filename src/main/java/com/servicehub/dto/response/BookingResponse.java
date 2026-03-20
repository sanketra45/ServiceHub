package com.servicehub.dto.response;

// This is the clean response object returned after any booking operation — creation, status update, fetch

import com.servicehub.model.enums.BookingStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private String serviceType;
    private String description;
    private LocalDate bookingDate;
    private LocalTime timeSlot;
    private BookingStatus status;
    private Double totalAmount;
    private String address;
    private LocalDateTime createdAt;
}
