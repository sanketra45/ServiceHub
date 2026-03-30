
package com.servicehub.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusResponse {
    private String paymentStatus;    // PAID / FAILED / PENDING
    private String cashfreeOrderId;
    private String cashfreePaymentId;
    private Double amountPaid;
    private String message;
}