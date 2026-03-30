// src/pages/CustomerDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, updateStatus } from "../api/bookings";
import { submitReview } from "../api/reviews";
import { getMyEmergencies } from "../api/emergency";
import { useAuth } from "../context/AuthContext";
import { Star, Zap, Plus, Clock, CheckCircle,
         XCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_META = {
  PENDING:     { color: "bg-amber-100 text-amber-700", icon: Clock,       dot: "bg-amber-400" },
  ACCEPTED:    { color: "bg-blue-100 text-blue-700",   icon: CheckCircle, dot: "bg-blue-400" },
  IN_PROGRESS: { color: "bg-violet-100 text-violet-700", icon: Loader,    dot: "bg-violet-400" },
  COMPLETED:   { color: "bg-sage/10 text-sage",        icon: CheckCircle, dot: "bg-sage" },
  CANCELLED:   { color: "bg-red-100 text-red-600",     icon: XCircle,     dot: "bg-red-400" },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [bookings, setBookings]       = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [tab, setTab]   = useState("bookings");
  const [review, setReview] = useState({
    show: false, bookingId: null, providerId: null, rating: 5, comment: ""
  });

  useEffect(() => {
    getMyBookings().then((r) => setBookings(r.data)).catch(() => {});
    getMyEmergencies().then((r) => setEmergencies(r.data)).catch(() => {});
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const { data } = await updateStatus(id, "CANCELLED");
      setBookings((b) => b.map((x) => x.id === id ? data : x));
      toast.success("Booking cancelled");
    } catch { toast.error("Cannot cancel at this stage"); }
  };

  const handleReview = async () => {
    try {
      await submitReview({ providerId: review.providerId,
        bookingId: review.bookingId, rating: review.rating,
        comment: review.comment });
      toast.success("Review submitted!");
      setReview((r) => ({ ...r, show: false }));
    } catch { toast.error("Review submission failed"); }
  };

  const stats = [
    { label: "Total Bookings", value: bookings.length, color: "text-navy" },
    { label: "Completed",
      value: bookings.filter((b) => b.status === "COMPLETED").length,
      color: "text-sage" },
    { label: "Pending",
      value: bookings.filter((b) => b.status === "PENDING").length,
      color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-cream pt-20">

      {/* Header */}
      <div className="bg-navy px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-2">
                Welcome back
              </p>
              <h1 className="font-serif text-4xl text-cream mb-6">
                {user?.name}
              </h1>
              <div className="flex gap-8">
                {stats.map(({ label, value, color }) => (
                  <div key={label}>
                    <p className={`font-serif text-3xl ${color} text-cream`}>
                      {value}
                    </p>
                    <p className="text-cream/40 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gold text-navy
                         px-5 py-2.5 rounded-full font-semibold text-sm
                         hover:bg-cream transition-all">
              <Plus size={15} /> New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "bookings",    label: "My Bookings" },
            { key: "emergencies", label: "Emergency Requests" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold
                         transition ${tab === key
                ? "bg-navy text-cream"
                : "bg-white border border-black/10 text-navy/50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {tab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl
                              border border-black/5">
                <p className="font-serif text-2xl text-navy/30 mb-2">
                  No bookings yet
                </p>
                <button onClick={() => navigate("/?tab=search")}
                  className="btn-primary mt-4 text-sm py-3">
                  Browse Services
                </button>
              </div>
            )}

            {bookings.map((b) => {
              const meta = STATUS_META[b.status] || STATUS_META.PENDING;
              const Icon = meta.icon;
              return (
                <div key={b.id}
                  className="bg-white rounded-3xl border border-black/5
                             shadow-sm overflow-hidden">
                  {/* Status bar */}
                  <div className={`h-1 ${meta.dot}`} />
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-xl text-navy">
                            {b.serviceType}
                          </h3>
                          <span className={`flex items-center gap-1.5 px-3
                                           py-1 rounded-full text-xs
                                           font-semibold ${meta.color}`}>
                            <Icon size={11} />
                            {b.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-navy/50 text-sm">
                          with <strong className="text-navy/70">
                            {b.providerName}
                          </strong>{" "}
                          · {b.bookingDate} at {b.timeSlot}
                        </p>
                        <p className="text-navy/40 text-sm mt-0.5">
                          {b.address}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-serif text-2xl text-navy">
                          ₹{b.totalAmount}
                        </p>
                        <p className="text-navy/30 text-xs">estimated</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      {b.status === "PENDING" && (
                        <button onClick={() => handleCancel(b.id)}
                          className="px-4 py-2 rounded-xl border
                                     border-red-200 text-red-500 text-sm
                                     font-medium hover:bg-red-50 transition">
                          Cancel
                        </button>
                      )}
                      {b.status === "COMPLETED" && (
                        <button onClick={() => setReview({
                            show: true, bookingId: b.id,
                            providerId: b.providerId, rating: 5, comment: ""
                          })}
                          className="flex items-center gap-1.5 px-4 py-2
                                     rounded-xl bg-gold/10 text-gold
                                     border border-gold/20 text-sm
                                     font-semibold hover:bg-gold/20 transition">
                          <Star size={13} fill="currentColor" />
                          Leave Review
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/provider/${b.providerId}`)}
                        className="px-4 py-2 rounded-xl border border-black/10
                                   text-navy/60 text-sm font-medium
                                   hover:bg-navy/5 transition">
                        View Provider
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Emergency tab */}
        {tab === "emergencies" && (
          <div className="space-y-4">
            {emergencies.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl
                              border border-black/5">
                <p className="font-serif text-2xl text-navy/30">
                  No emergency requests
                </p>
              </div>
            )}
            {emergencies.map((e) => (
              <div key={e.id}
                className="bg-white rounded-3xl border border-red-100
                           shadow-sm p-7">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50
                                  flex items-center justify-center">
                    <Zap size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-navy">
                      {e.serviceType}
                    </h3>
                    <p className="text-navy/40 text-xs">
                      {new Date(e.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-red-50 text-red-600
                                   rounded-full text-xs font-semibold">
                    {e.status}
                  </span>
                </div>
                {e.assignedProvider && (
                  <p className="text-navy/60 text-sm">
                    Assigned to: <strong>{e.assignedProvider.user?.name}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {review.show && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex
                        items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-4xl p-10 max-w-md w-full
                          shadow-2xl">
            <h2 className="font-serif text-3xl text-navy mb-2">
              Leave a Review
            </h2>
            <p className="text-navy/50 text-sm mb-8">
              Share your experience with this professional
            </p>

            <div className="flex gap-3 mb-6 justify-center">
              {[1,2,3,4,5].map((s) => (
                <button key={s}
                  onClick={() => setReview((r) => ({ ...r, rating: s }))}>
                  <Star size={32}
                    className={`transition ${s <= review.rating
                      ? "text-gold" : "text-navy/10"}`}
                    fill="currentColor" />
                </button>
              ))}
            </div>

            <textarea rows={4}
              value={review.comment}
              onChange={(e) =>
                setReview((r) => ({ ...r, comment: e.target.value }))}
              placeholder="Describe your experience..."
              className="input resize-none mb-6"
            />

            <div className="flex gap-3">
              <button onClick={handleReview}
                className="flex-1 btn-primary py-3.5">
                Submit
              </button>
              <button onClick={() => setReview((r) => ({ ...r, show: false }))}
                className="flex-1 btn-outline py-3.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}