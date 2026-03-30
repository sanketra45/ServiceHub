package com.servicehub.model;

// It represents a service booking/order in your system

import com.servicehub.model.enums.BookingStatus;
import com.servicehub.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private ServiceProvider provider;

    private String serviceType;
    private String description;

    private LocalDate bookingDate;
    private LocalTime timeSlot;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    private Double totalAmount;
    private String address;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Add these fields to your existing Booking.java entity

    // Cashfree order ID (we generate this — "CF_" + bookingId + timestamp)
    private String cashfreeOrderId;

    // Cashfree payment session ID (short-lived, used to open checkout)
    private String paymentSessionId;

    // Cashfree payment link (alternate to SDK)
    private String paymentLink;

    // Confirmed payment ID from Cashfree
    private String cashfreePaymentId;

    // Payment status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
}
