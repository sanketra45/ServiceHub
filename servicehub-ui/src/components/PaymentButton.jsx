// src/components/PaymentButton.jsx
import { useState } from "react";
import { createCashfreeOrder } from "../api/payment";
import { Shield, CreditCard, CheckCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentButton({ booking, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const isPaid = booking?.paymentStatus === "PAID";

    const handlePayment = async () => {
        if (isPaid) return;
        setLoading(true);

        try {
            // Step 1 — Create Cashfree order on backend
            const { data: orderData } = await createCashfreeOrder(booking.id);

            // Step 2 — Check Cashfree SDK is loaded
            if (!window.Cashfree) {
                throw new Error(
                    "Cashfree SDK not loaded. Check your internet connection or index.html."
                );
            }

            // Step 3 — Initialize Cashfree checkout
            const cashfree = window.Cashfree({
                mode: orderData.environment === "PROD" ? "production" : "sandbox",
            });

            // Step 4 — Open Cashfree checkout
            const checkoutOptions = {
                paymentSessionId: orderData.paymentSessionId,

                // Where Cashfree redirects after payment
                // This must match the return_url you set on the backend
                returnUrl:
                    window.location.origin +
                    `/payment/callback?order_id=${orderData.cashfreeOrderId}&booking_id=${orderData.bookingId}`,

                // Open inline (inside your page) — set to "redirect" to use full-page redirect
                style: {
                    backgroundColor: "#ffffff",
                    color: "#0f1b2d",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "14px",
                    errorColor: "#ef4444",
                    theme: "light",
                },
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    // Checkout failed to load
                    toast.error(result.error.message || "Payment failed to open.");
                    setLoading(false);
                }

                if (result.redirect) {
                    // Cashfree is redirecting to payment page
                    // Nothing to do — the redirect will happen automatically
                    console.log("Cashfree redirect in progress...");
                }

                if (result.paymentDetails) {
                    // Payment completed inline (rare — most flows redirect)
                    toast.success("Payment completed!");
                    onSuccess?.();
                    setLoading(false);
                }
            });

        } catch (err) {
            toast.error(
                err.response?.data?.message || err.message || "Payment initiation failed."
            );
            setLoading(false);
        }
    };

    // Already paid
    if (isPaid) {
        return (
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "14px 24px", borderRadius: "14px",
                background: "rgba(74,124,89,0.1)",
                border: "1px solid rgba(74,124,89,0.3)",
            }}>
                <CheckCircle size={18} color="#4a7c59" />
                <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "14px", fontWeight: 600, color: "#4a7c59",
                }}>
                    Payment Confirmed ✓
                </span>
            </div>
        );
    }

    return (
        <div>
            {/* Cashfree pay button */}
            <button
                onClick={handlePayment}
                disabled={loading}
                style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "10px",
                    width: "100%", padding: "16px 32px",
                    borderRadius: "14px",
                    background: loading ? "rgba(15,27,45,0.4)" : "#0f1b2d",
                    color: "#f5f0e8",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "15px", fontWeight: 600,
                    letterSpacing: "0.02em",
                    transition: "all 0.25s ease",
                    boxShadow: loading ? "none" : "0 8px 24px rgba(15,27,45,0.22)",
                }}
                onMouseEnter={(e) => {
                    if (!loading) {
                        e.currentTarget.style.background = "#c9a84c";
                        e.currentTarget.style.color = "#0f1b2d";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!loading) {
                        e.currentTarget.style.background = "#0f1b2d";
                        e.currentTarget.style.color = "#f5f0e8";
                    }
                }}
            >
                {loading ? (
                    <>
                        <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                        Opening Cashfree...
                    </>
                ) : (
                    <>
                        <CreditCard size={16} />
                        Pay ₹{booking?.totalAmount?.toFixed(0)} via Cashfree
                    </>
                )}
            </button>

            {/* Accepted payment methods */}
            <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "8px", marginTop: "14px",
            }}>
                {/* Method icons */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {["UPI", "Cards", "Net Banking", "Wallets"].map((method) => (
                        <span key={method} style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "10px", fontWeight: 600,
                            color: "rgba(15,27,45,0.4)",
                            padding: "3px 8px", borderRadius: "6px",
                            background: "rgba(15,27,45,0.05)",
                            border: "1px solid rgba(15,27,45,0.08)",
                        }}>{method}</span>
                    ))}
                </div>

                {/* Trust badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Shield size={11} color="rgba(15,27,45,0.28)" />
                    <span style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "11px", color: "rgba(15,27,45,0.35)",
                    }}>
                        Secured by Cashfree · PCI-DSS compliant · 256-bit SSL
                    </span>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}