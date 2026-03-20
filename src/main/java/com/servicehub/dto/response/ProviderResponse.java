package com.servicehub.dto.response;

// THIS CLASS SENDS PROVIDER INFORMATION TO THE USER ( FROM BACKEND TO THE FRONTEND )

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String serviceType;
    private String description;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double hourlyRate;
    private Integer experienceYears;
    private Double averageRating;
    private Integer totalReviews;
    private boolean verified;
    private String photoUrl;
    private List<String> servicesOffered;
}
