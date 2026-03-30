// service/CashfreePaymentService.java
package com.servicehub.service;

import com.servicehub.dto.response.BookingResponse;
import com.servicehub.dto.response.PaymentOrderResponse;
import com.servicehub.dto.response.PaymentStatusResponse;
import com.servicehub.model.Booking;
import com.servicehub.model.enums.BookingStatus;
import com.servicehub.model.enums.PaymentStatus;
import com.servicehub.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CashfreePaymentService {

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;

    @Value("${cashfree.app.id}")
    private String appId;

    @Value("${cashfree.secret.key}")
    private String secretKey;

    @Value("${cashfree.api.version}")
    private String apiVersion;

    @Value("${cashfree.base.url}")
    private String baseUrl;

    @Value("${app.base-url}")
    private String appBaseUrl;

    // ── Build common headers for every Cashfree API call ──────
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id",     appId);
        headers.set("x-client-secret", secretKey);
        headers.set("x-api-version",   apiVersion);
        return headers;
    }

    // ── Step 1: Create a Cashfree order + payment session ─────
    // Called when customer clicks "Pay Now".
    // Returns a payment_session_id the frontend uses to open checkout.
    public PaymentOrderResponse createOrder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("This booking is already paid.");
        }

        // Generate a unique order ID for Cashfree
        // Must be unique per transaction — max 50 chars, alphanumeric + underscore
        String cashfreeOrderId = "CF_" + bookingId + "_" + System.currentTimeMillis();

        // Build request body exactly as Cashfree v3 API expects
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("order_id",       cashfreeOrderId);
        requestBody.put("order_amount",   booking.getTotalAmount());
        requestBody.put("order_currency", "INR");
        requestBody.put("order_note",     booking.getServiceType() + " booking #" + bookingId);

        // Customer details — all required by Cashfree
        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("customer_id",    "CUST_" + booking.getCustomer().getId());
        customerDetails.put("customer_name",  booking.getCustomer().getName());
        customerDetails.put("customer_email", booking.getCustomer().getEmail());
        customerDetails.put("customer_phone", booking.getCustomer().getPhone());
        requestBody.put("customer_details", customerDetails);

        // Return URLs — where Cashfree redirects after payment
        Map<String, Object> orderMeta = new HashMap<>();
        orderMeta.put("return_url",
                appBaseUrl + "/payment/callback?order_id={order_id}&booking_id=" + bookingId);
        orderMeta.put("notify_url",
                "http://localhost:8080/api/payments/webhook"); // webhook for server-side confirmation
        requestBody.put("order_meta", orderMeta);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, buildHeaders());

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/orders",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) throw new RuntimeException("Empty response from Cashfree");

            String paymentSessionId = (String) body.get("payment_session_id");

            // Save to booking
            booking.setCashfreeOrderId(cashfreeOrderId);
            booking.setPaymentSessionId(paymentSessionId);
            booking.setPaymentStatus(PaymentStatus.INITIATED);
            bookingRepository.save(booking);

            log.info("Cashfree order created: {} for booking: {}", cashfreeOrderId, bookingId);

            // Determine environment for frontend SDK
            String environment = baseUrl.contains("sandbox") ? "TEST" : "PROD";

            return PaymentOrderResponse.builder()
                    .cashfreeOrderId(cashfreeOrderId)
                    .paymentSessionId(paymentSessionId)
                    .amount(booking.getTotalAmount())
                    .currency("INR")
                    .bookingId(bookingId)
                    .customerName(booking.getCustomer().getName())
                    .customerEmail(booking.getCustomer().getEmail())
                    .customerPhone(booking.getCustomer().getPhone())
                    .description(booking.getServiceType() + " — " + booking.getBookingDate())
                    .environment(environment)
                    .build();

        } catch (Exception e) {
            log.error("Cashfree order creation failed: {}", e.getMessage());
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    // ── Step 2: Verify payment status via Cashfree API ────────
    // After customer pays, Cashfree redirects to return_url.
    // We then call Cashfree API to get the REAL payment status.
    // NEVER trust frontend-side status — always verify server-side.
    public PaymentStatusResponse verifyPayment(Long bookingId, String cashfreeOrderId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify the order ID matches
        if (!cashfreeOrderId.equals(booking.getCashfreeOrderId())) {
            throw new RuntimeException("Order ID mismatch. Verification failed.");
        }

        HttpEntity<Void> entity = new HttpEntity<>(buildHeaders());

        try {
            // Get order details from Cashfree
            ResponseEntity<Map> orderResponse = restTemplate.exchange(
                    baseUrl + "/orders/" + cashfreeOrderId,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> orderBody = orderResponse.getBody();
            if (orderBody == null) throw new RuntimeException("Empty response from Cashfree");

            String orderStatus = (String) orderBody.get("order_status");
            log.info("Cashfree order status for {}: {}", cashfreeOrderId, orderStatus);

            if ("PAID".equalsIgnoreCase(orderStatus)) {
                // Get payment details
                ResponseEntity<Map[]> paymentsResponse = restTemplate.exchange(
                        baseUrl + "/orders/" + cashfreeOrderId + "/payments",
                        HttpMethod.GET,
                        entity,
                        Map[].class
                );

                Map[] payments = paymentsResponse.getBody();
                String paymentId = null;
                Double amountPaid = null;

                if (payments != null && payments.length > 0) {
                    // Get the latest successful payment
                    for (Map payment : payments) {
                        if ("SUCCESS".equalsIgnoreCase((String) payment.get("payment_status"))) {
                            paymentId  = (String) payment.get("cf_payment_id");
                            amountPaid = ((Number) payment.get("order_amount")).doubleValue();
                            break;
                        }
                    }
                }

                // Update booking as PAID
                booking.setCashfreePaymentId(paymentId);
                booking.setPaymentStatus(PaymentStatus.PAID);
                bookingRepository.save(booking);

                return PaymentStatusResponse.builder()
                        .paymentStatus("PAID")
                        .cashfreeOrderId(cashfreeOrderId)
                        .cashfreePaymentId(paymentId)
                        .amountPaid(amountPaid)
                        .message("Payment successful. Booking confirmed.")
                        .build();

            } else if ("EXPIRED".equalsIgnoreCase(orderStatus)
                    || "CANCELLED".equalsIgnoreCase(orderStatus)) {

                booking.setPaymentStatus(PaymentStatus.FAILED);
                bookingRepository.save(booking);

                return PaymentStatusResponse.builder()
                        .paymentStatus("FAILED")
                        .cashfreeOrderId(cashfreeOrderId)
                        .message("Payment " + orderStatus.toLowerCase() + ".")
                        .build();

            } else {
                // ACTIVE / PENDING — payment still in progress
                return PaymentStatusResponse.builder()
                        .paymentStatus("PENDING")
                        .cashfreeOrderId(cashfreeOrderId)
                        .message("Payment is still being processed.")
                        .build();
            }

        } catch (Exception e) {
            log.error("Cashfree verification failed: {}", e.getMessage());
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    // ── Webhook: Cashfree calls this automatically ─────────────
    // Cashfree sends a POST to your notify_url on every payment event.
    // This is a backup — don't rely on frontend-only confirmation.
    public void handleWebhook(Map<String, Object> payload) {
        try {
            String type = (String) payload.get("type");
            if (!"PAYMENT_SUCCESS_WEBHOOK".equals(type)) return;

            Map<String, Object> data   = (Map<String, Object>) payload.get("data");
            Map<String, Object> order  = (Map<String, Object>) data.get("order");
            Map<String, Object> payment = (Map<String, Object>) data.get("payment");

            String cashfreeOrderId = (String) order.get("order_id");
            String paymentId       = (String) payment.get("cf_payment_id");
            String paymentStatus   = (String) payment.get("payment_status");

            if (!"SUCCESS".equalsIgnoreCase(paymentStatus)) return;

            // Find booking by cashfree order ID
            bookingRepository.findAll().stream()
                    .filter(b -> cashfreeOrderId.equals(b.getCashfreeOrderId()))
                    .findFirst()
                    .ifPresent(booking -> {
                        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
                            booking.setCashfreePaymentId(paymentId);
                            booking.setPaymentStatus(PaymentStatus.PAID);
                            bookingRepository.save(booking);
                            log.info("Booking {} marked PAID via webhook", booking.getId());
                        }
                    });

        } catch (Exception e) {
            log.error("Webhook processing error: {}", e.getMessage());
        }
    }

    // ── Initiate Refund ────────────────────────────────────────
    public void initiateRefund(Long bookingId, String refundNote) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Cannot refund — booking is not paid.");
        }

        String refundId = "REFUND_" + bookingId + "_" + System.currentTimeMillis();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("refund_amount", booking.getTotalAmount());
        requestBody.put("refund_id",     refundId);
        requestBody.put("refund_note",   refundNote != null ? refundNote : "Booking cancelled");

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, buildHeaders());

        try {
            restTemplate.exchange(
                    baseUrl + "/orders/" + booking.getCashfreeOrderId() + "/refunds",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            bookingRepository.save(booking);

            log.info("Refund initiated for booking: {}", bookingId);

        } catch (Exception e) {
            log.error("Refund failed: {}", e.getMessage());
            throw new RuntimeException("Refund failed: " + e.getMessage());
        }
    }
}