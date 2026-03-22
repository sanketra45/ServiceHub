package com.servicehub.dto.response;

// IT RETURNS THE SUMMARY OF USERS DATA SENT TO THE ADMIN

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalProviders;
    private long totalBookings;
    private long completedBookings;
    private long pendingBookings;
    private double totalRevenue;
    private long verifiedProviders;
    private String topServiceType;
}
