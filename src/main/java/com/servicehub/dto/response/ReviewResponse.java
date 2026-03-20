package com.servicehub.dto.response;

// THIS IS THE RESPONSE OBJECT THAT REPRESENT WHO WROTE THE RESPONSE, WHEN AND COMMENT

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
