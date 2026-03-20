package com.servicehub.dto.request;

// IT IS USED WHEN THE USER( SERVICE PROVIDER ) CREATES OR UPDATES THEIR PROFILES
// DATA TRANSFERS FROM FRONTEND TO BACKEND

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class ProviderRequest {

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String description;

    @NotBlank(message = "City is required")
    private String city;

    private String address;
    private Double latitude;
    private Double longitude;

    @NotNull(message = "Hourly rate is required")
    @Min(value = 0, message = "Rate must be positive")
    private Double hourlyRate;

    @Min(value = 0)
    private Integer experienceYears;

    private List<String> servicesOffered;
}
