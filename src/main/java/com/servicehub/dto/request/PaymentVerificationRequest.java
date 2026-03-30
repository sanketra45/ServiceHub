package com.servicehub.dto.request;


import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private Long   bookingId;
    private String cashfreeOrderId; // our order ID sent to Cashfree
}
