package com.servicehub.model;

// This entity stores an emergency service request
// — who needs help, what type, where, and which provider was auto-assigned.

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Auto-assigned best available provider
    @ManyToOne
    @JoinColumn(name = "provider_id")
    private ServiceProvider assignedProvider;

    @Column(nullable = false)
    private String serviceType;

    @Column(nullable = false)
    private String city;

    private String description;
    private String address;
    private Double latitude;
    private Double longitude;

    // PENDING → PROVIDER_FOUND → ACCEPTED → RESOLVED
    private String status = "PENDING";

    private LocalDateTime requestedAt;

    @PrePersist
    public void prePersist() {
        this.requestedAt = LocalDateTime.now();
    }
}
