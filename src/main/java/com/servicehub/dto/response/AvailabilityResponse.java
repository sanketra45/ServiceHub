package com.servicehub.dto.response;

// IT SENDS THE DATA OF AVALIBILITY FROM BACKEND TO THE FRONTEND ON REQUEST

import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    private Long id;
    private Long providerId;
    private String providerName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
}