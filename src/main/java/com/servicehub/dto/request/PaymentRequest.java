package com.servicehub.dto.request;


import lombok.Data;

@Data
public class PaymentRequest {
    // The booking ID to create a Razorpay order for
    private Long bookingId;
}
