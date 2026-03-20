package com.servicehub.dto.request;

// THIS IS WHAT THE CUSTOMER SUBMITS AFTER A SUCCESSFUL SERVICE

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull
    private Long providerId;

    @NotNull
    private Long bookingId;

    @NotNull
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comment;
}
