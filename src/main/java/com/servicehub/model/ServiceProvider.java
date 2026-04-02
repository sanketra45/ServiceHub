package com.servicehub.model;

// It represents a service provider (worker) in your system

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "service_providers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String serviceType;   // e.g. "Electrician"
    private String description;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;

    private Double hourlyRate;
    private Integer experienceYears;

    @Builder.Default
    private Double averageRating = 0.0;
    
    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private boolean verified = false;
    private String photoUrl;

    @ElementCollection
    @CollectionTable(name = "provider_services", joinColumns = @JoinColumn(name = "provider_id"))
    @Column(name = "service")
    private List<String> servicesOffered;

    @ElementCollection
    @CollectionTable(name = "provider_work_images", joinColumns = @JoinColumn(name = "provider_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> workImages = new java.util.ArrayList<>();
}