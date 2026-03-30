// src/api/payments.js
import api from "./axios";

// Create Cashfree order and get payment_session_id
export const createCashfreeOrder = (bookingId) =>
    api.post("/payments/create-order", null, { params: { bookingId } });

// Verify payment after Cashfree redirect
export const verifyCashfreePayment = (bookingId, cashfreeOrderId) =>
    api.get("/payments/verify", {
        params: { bookingId, cashfreeOrderId },
    });

// Request refund
export const requestRefund = (bookingId, note) =>
    api.post(`/payments/refund/${bookingId}`, null, {
        params: { note },
    });