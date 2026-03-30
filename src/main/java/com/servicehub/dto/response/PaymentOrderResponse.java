package com.servicehub.dto.response;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String  cashfreeOrderId;    // CF_bookingId_timestamp
    private String  paymentSessionId;   // used by Cashfree JS SDK
    private Double  amount;
    private String  currency;
    private Long    bookingId;
    private String  customerName;
    private String  customerEmail;
    private String  customerPhone;
    private String  description;
    private String  environment;        // "TEST" or "PROD"
}
