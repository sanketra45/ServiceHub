// src/pages/PaymentCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyCashfreePayment } from "../api/payment";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying | paid | failed
    const [message, setMessage] = useState("");

    useEffect(() => {
        const orderId = searchParams.get("order_id");
        const bookingId = searchParams.get("booking_id");

        if (!orderId || !bookingId) {
            setStatus("failed");
            setMessage("Missing payment details. Please contact support.");
            return;
        }

        // Verify with backend
        verifyCashfreePayment(bookingId, orderId)
            .then(({ data }) => {
                if (data.paymentStatus === "PAID") {
                    setStatus("paid");
                    setMessage(`Payment of ₹${data.amountPaid} confirmed!`);
                } else if (data.paymentStatus === "FAILED") {
                    setStatus("failed");
                    setMessage(data.message || "Payment failed.");
                } else {
                    setStatus("pending");
                    setMessage("Payment is being processed. Check your dashboard.");
                }
            })
            .catch(() => {
                setStatus("failed");
                setMessage("Verification failed. Please check your dashboard.");
            });
    }, []);

    return (
        <div style={{
            minHeight: "100vh", background: "#f5f0e8",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "32px",
        }}>
            <div style={{
                background: "#ffffff", borderRadius: "28px", padding: "56px 48px",
                maxWidth: "480px", width: "100%", textAlign: "center",
                boxShadow: "0 8px 40px rgba(15,27,45,0.1)",
                border: "1px solid rgba(15,27,45,0.07)",
            }}>

                {/* Verifying */}
                {status === "verifying" && (
                    <>
                        <div style={{
                            width: "72px", height: "72px", borderRadius: "50%",
                            background: "rgba(15,27,45,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 24px",
                        }}>
                            <Loader size={32} color="#0f1b2d"
                                style={{ animation: "spin 1s linear infinite" }} />
                        </div>
                        <h2 style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: "1.75rem", color: "#0f1b2d", marginBottom: "10px",
                        }}>Verifying Payment</h2>
                        <p style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "14px", color: "rgba(15,27,45,0.45)",
                        }}>
                            Please wait while we confirm your payment with Cashfree...
                        </p>
                    </>
                )}

                {/* Success */}
                {status === "paid" && (
                    <>
                        <div style={{
                            width: "72px", height: "72px", borderRadius: "50%",
                            background: "rgba(74,124,89,0.1)",
                            border: "2px solid #4a7c59",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 24px",
                        }}>
                            <CheckCircle size={32} color="#4a7c59" />
                        </div>
                        <h2 style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: "1.75rem", color: "#0f1b2d", marginBottom: "10px",
                        }}>Payment Successful!</h2>
                        <p style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "14px", color: "rgba(15,27,45,0.5)",
                            marginBottom: "32px",
                        }}>{message}</p>
                        <button onClick={() => navigate("/dashboard")}
                            style={{
                                padding: "13px 32px", borderRadius: "50px",
                                background: "#0f1b2d", color: "#f5f0e8",
                                border: "none", cursor: "pointer",
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "14px", fontWeight: 600,
                                transition: "background 0.25s", width: "100%",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#c9a84c")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#0f1b2d")}
                        >View My Bookings</button>
                    </>
                )}

                {/* Failed */}
                {(status === "failed" || status === "pending") && (
                    <>
                        <div style={{
                            width: "72px", height: "72px", borderRadius: "50%",
                            background: "rgba(239,68,68,0.08)",
                            border: "2px solid rgba(239,68,68,0.4)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 24px",
                        }}>
                            <XCircle size={32} color="#ef4444" />
                        </div>
                        <h2 style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: "1.75rem", color: "#0f1b2d", marginBottom: "10px",
                        }}>
                            {status === "pending" ? "Payment Pending" : "Payment Failed"}
                        </h2>
                        <p style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "14px", color: "rgba(15,27,45,0.5)",
                            marginBottom: "32px",
                        }}>{message}</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => navigate(-1)} style={{
                                flex: 1, padding: "13px", borderRadius: "50px",
                                background: "#0f1b2d", color: "#f5f0e8",
                                border: "none", cursor: "pointer",
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "14px", fontWeight: 600,
                            }}>Try Again</button>
                            <button onClick={() => navigate("/dashboard")} style={{
                                flex: 1, padding: "13px", borderRadius: "50px",
                                background: "transparent", color: "#0f1b2d",
                                border: "1px solid rgba(15,27,45,0.2)",
                                cursor: "pointer",
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "14px", fontWeight: 500,
                            }}>Dashboard</button>
                        </div>
                    </>
                )}

                <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    );
}