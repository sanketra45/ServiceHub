import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProvider, getFreeSlots } from "../api/providers";
import {
  Calendar, Clock, MapPin,
  ArrowLeft, CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import PaymentButton from "../components/PaymentButton";
import { CreditCard } from "lucide-react";

export default function BookingFlow() {
  const [booking, setBooking] = useState(null);
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [freeSlots, setFreeSlots] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    providerId: Number(providerId),
    serviceType: "", description: "",
    bookingDate: "", timeSlot: "", address: "",
  });

  useEffect(() => {
    getProvider(providerId).then((r) => {
      setProvider(r.data);
      setForm((f) => ({ ...f, serviceType: r.data.serviceType }));
    });
  }, [providerId]);

  const handleDateChange = async (date) => {
    setForm((f) => ({ ...f, bookingDate: date, timeSlot: "" }));
    if (date) {
      try {
        const { data } = await getFreeSlots(providerId, date);
        setFreeSlots(data);
      } catch { setFreeSlots([]); }
    }
  };

  const handleSubmit = async () => {
    // ✅ Validation
    if (!form.timeSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!form.address) {
      toast.error("Please enter your address");
      return;
    }
    if (!form.bookingDate) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);

    try {
      console.log("RAW SLOT:", form.timeSlot);

      // ✅ Time parsing
      let startTime;
      if (form.timeSlot.includes("-")) {
        [startTime] = form.timeSlot.split("-");
      } else {
        startTime = form.timeSlot;
      }

      // ✅ Format HH:mm:ss
      const formattedTime =
        startTime.trim().length === 5 ? `${startTime.trim()}:00` : startTime.trim();

      // ✅ Payload
      const payload = {
        providerId: form.providerId,
        bookingDate: form.bookingDate,
        timeSlot: formattedTime,
        address: form.address,
        serviceType: form.serviceType,
        description: form.description || ""
      };

      console.log("FINAL PAYLOAD:", payload);

      // ✅ API call
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("BOOKING SUCCESS:", response.data);

      setBooking(response.data);
      setStep(4);

      toast.success("Booking confirmed 🎉");

    } catch (error) {
      console.error("FULL ERROR:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Booking failed");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!provider) return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10
                      border-2 border-navy border-t-transparent" />
    </div>
  );

  const STEPS = ["Service", "Date & Time", "Details", "Payment", "Confirmed"];

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20">
      <div className="max-w-2xl mx-auto px-8 py-12">

        {/* Back */}
        <button onClick={() => navigate(`/provider/${providerId}`)}
          className="flex items-center gap-2 text-navy/40 dark:text-slate-400 hover:text-navy dark:text-white
                     text-sm mb-8 transition">
          <ArrowLeft size={15} /> Back to profile
        </button>

        {step < 4 ? (
          <>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-10">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-7 h-7
                                  rounded-full text-xs font-bold transition
                                  ${i + 1 < step
                      ? "bg-sage dark:bg-emerald-600/90 text-cream dark:text-slate-100"
                      : i + 1 === step
                        ? "bg-navy dark:bg-slate-900 text-cream dark:text-slate-100"
                        : "bg-navy/10 dark:bg-slate-800 text-navy/30 dark:text-slate-500"}`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block
                                   ${i + 1 === step
                      ? "text-navy dark:text-white"
                      : "text-navy/30 dark:text-slate-500"}`}>
                    {s}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px w-8
                                    ${i + 1 < step
                        ? "bg-sage dark:bg-emerald-600/90" : "bg-navy/10 dark:bg-slate-800"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Provider mini card */}
            <div className="flex items-center gap-4 bg-navy dark:bg-slate-900 rounded-2xl
                            p-5 mb-8">
              <div className="w-12 h-12 rounded-xl bg-cream/10
                              overflow-hidden flex-shrink-0">
                {provider.photoUrl ? (
                  <img src={`${import.meta.env.VITE_API_URL}${provider.photoUrl}`}
                    alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-cream/40 dark:text-slate-500">
                      {provider.name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-serif text-cream dark:text-slate-100">{provider.name}</p>
                <p className="text-cream/50 text-sm">{provider.serviceType}</p>
              </div>
              <p className="font-serif text-2xl text-gold dark:text-amber-400">
                ₹{provider.hourlyRate}
                <span className="text-sm text-gold/50">/hr</span>
              </p>
            </div>

            {/* Step 1 — Service */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Problem Description</label>
                  <textarea rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what needs to be done..."
                    className="input resize-none w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full py-4">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 — Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="label flex items-center gap-2">
                    <Calendar size={12} /> Select Date
                  </label>
                  <input type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.bookingDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="input w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                </div>

                {form.bookingDate && (
                  <div>
                    <label className="label flex items-center gap-2">
                      <Clock size={12} /> Available Slots
                    </label>
                    {freeSlots.length === 0 ? (
                      <p className="text-navy/40 dark:text-slate-400 text-sm py-4">
                        No slots available for this date. Try another day.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {freeSlots.map((slot) => (
                          <button key={slot} type="button"
                            onClick={() => setForm({ ...form, timeSlot: slot })}
                            className={`py-3 rounded-xl text-sm font-semibold
                                       border transition ${form.timeSlot === slot
                                ? "bg-navy dark:bg-slate-900 text-cream dark:text-slate-100 border-navy"
                                : "bg-white dark:bg-slate-800 border-black/10 dark:border-slate-600 text-navy/60 dark:text-slate-300"
                                + " hover:border-navy/30"}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 py-4">
                    ← Back
                  </button>
                  <button
                    onClick={() => form.bookingDate && form.timeSlot && setStep(3)}
                    disabled={!form.bookingDate || !form.timeSlot}
                    className="btn-primary flex-1 py-4 disabled:opacity-40">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Address */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="label flex items-center gap-2">
                    <MapPin size={12} /> Service Address
                  </label>
                  <textarea rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })}
                    placeholder="Full address where service is needed"
                    className="input resize-none w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 py-4">
                    ← Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="btn-primary flex-1 py-4 disabled:opacity-50">
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : step === 4 && booking ? (
          /* Step 4 — Payment */
          <div>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "18px",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <CreditCard size={26} color="#c9a84c" />
              </div>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "2rem", color: "#0f1b2d", marginBottom: "8px",
              }}>Complete Payment</h2>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px", color: "rgba(15,27,45,0.45)",
              }}>
                Booking reserved · Pay to confirm your slot
              </p>
            </div>

            {/* Summary */}
            <div style={{
              background: "rgba(15,27,45,0.03)", borderRadius: "16px",
              padding: "20px", border: "1px solid rgba(15,27,45,0.07)",
              marginBottom: "24px",
            }}>
              {[
                ["Provider", booking.providerName],
                ["Service", booking.serviceType],
                ["Date", booking.bookingDate],
                ["Time", booking.timeSlot],
                ["Address", booking.address],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(15,27,45,0.05)",
                }}>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px", color: "rgba(15,27,45,0.4)",
                  }}>{label}</span>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px", fontWeight: 500, color: "#0f1b2d",
                  }}>{val}</span>
                </div>
              ))}
              <div style={{
                display: "flex", justifyContent: "space-between", paddingTop: "14px",
              }}>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "15px", fontWeight: 600, color: "#0f1b2d",
                }}>Total</span>
                <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "26px", color: "#c9a84c",
                }}>₹{booking.totalAmount}</span>
              </div>
            </div>

            {/* Cashfree Pay Button */}
            <PaymentButton
              booking={booking}
              onSuccess={() => setStep(5)}
            />
          </div>
        ) : step === 5 ? (
          /* Step 5 — Confirmed */
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "rgba(74,124,89,0.1)", border: "2px solid #4a7c59",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <CheckCircle size={36} color="#4a7c59" />
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "2.25rem", color: "#0f1b2d", marginBottom: "10px",
            }}>Booking Confirmed!</h2>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "15px", color: "rgba(15,27,45,0.45)", marginBottom: "40px",
            }}>
              Payment received · Booking #{booking?.id}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => navigate("/dashboard")} style={{
                padding: "13px 28px", borderRadius: "50px",
                background: "#0f1b2d", color: "#f5f0e8",
                border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px", fontWeight: 600,
                transition: "background 0.25s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#c9a84c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0f1b2d")}
              >View Dashboard</button>
              <button onClick={() => navigate("/?tab=search")} style={{
                padding: "13px 28px", borderRadius: "50px",
                background: "transparent", color: "#0f1b2d",
                border: "1px solid rgba(15,27,45,0.2)", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: "14px", fontWeight: 500,
              }}>Browse More</button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}