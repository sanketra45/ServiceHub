// controller/PaymentController.java
package com.servicehub.controller;

import com.servicehub.dto.response.PaymentOrderResponse;
import com.servicehub.dto.response.PaymentStatusResponse;
import com.servicehub.model.User;
import com.servicehub.service.CashfreePaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final CashfreePaymentService cashfreePaymentService;

    // POST /api/payments/create-order?bookingId=1
    // Creates a Cashfree order and returns payment_session_id
    @PostMapping("/create-order")
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @RequestParam Long bookingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cashfreePaymentService.createOrder(bookingId));
    }

    // GET /api/payments/verify?bookingId=1&cashfreeOrderId=CF_1_123456
    // Verifies payment status with Cashfree API after redirect
    @GetMapping("/verify")
    public ResponseEntity<PaymentStatusResponse> verifyPayment(
            @RequestParam Long bookingId,
            @RequestParam String cashfreeOrderId) {
        return ResponseEntity.ok(
                cashfreePaymentService.verifyPayment(bookingId, cashfreeOrderId));
    }

    // POST /api/payments/webhook
    // Cashfree calls this automatically on every payment event
    // Must be publicly accessible — no auth header
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody Map<String, Object> payload) {
        cashfreePaymentService.handleWebhook(payload);
        return ResponseEntity.ok().build();
    }

    // POST /api/payments/refund/{bookingId}
    @PostMapping("/refund/{bookingId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('CUSTOMER')")
    public ResponseEntity<Map<String, String>> refund(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String note) {
        cashfreePaymentService.initiateRefund(bookingId, note);
        return ResponseEntity.ok(Map.of("message", "Refund initiated successfully."));
    }
}