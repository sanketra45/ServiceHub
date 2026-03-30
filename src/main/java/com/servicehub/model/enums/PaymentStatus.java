package com.servicehub.model.enums;


public enum PaymentStatus {
    PENDING,    // Booking created, payment not started
    INITIATED,  // Razorpay order created, awaiting payment
    PAID,       // Payment verified and confirmed
    FAILED,     // Payment failed or signature mismatch
    REFUNDED    // Payment refunded
}
