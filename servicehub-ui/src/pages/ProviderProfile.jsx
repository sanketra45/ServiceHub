// src/pages/ProviderProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, BadgeCheck, Briefcase,
         Clock, ArrowLeft, Calendar } from "lucide-react";
import { getProvider } from "../api/providers";
import { getProviderReviews } from "../api/reviews";
import { useAuth } from "../context/AuthContext";

const FALLBACK = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop",
];

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews]   = useState([]);

  useEffect(() => {
    getProvider(id).then((r) => setProvider(r.data));
    getProviderReviews(id).then((r) => setReviews(r.data));
  }, [id]);

  if (!provider) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10
                      border-2 border-navy border-t-transparent" />
    </div>
  );

  const photo = provider.photoUrl
    ? `http://localhost:8080${provider.photoUrl}`
    : FALLBACK[provider.id % 3];

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero banner */}
      <div className="relative h-80 overflow-hidden">
        <img src={photo} alt={provider.name}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t
                        from-navy/90 via-navy/40 to-transparent" />

        <button onClick={() => navigate(-1)}
          className="absolute top-24 left-8 flex items-center gap-2
                     text-cream/70 hover:text-cream transition text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Provider name on hero */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="max-w-5xl mx-auto">
            {provider.verified && (
              <div className="flex items-center gap-1.5 mb-2">
                <BadgeCheck size={14} className="text-gold" />
                <span className="text-gold text-xs font-semibold
                                 uppercase tracking-widest">
                  Verified Professional
                </span>
              </div>
            )}
            <h1 className="font-serif text-4xl text-cream">{provider.name}</h1>
            <p className="text-cream/70 mt-1">{provider.serviceType}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Star,      val: provider.averageRating?.toFixed(1) || "New",
                  sub: `${provider.totalReviews} reviews`, color: "text-gold" },
                { icon: Briefcase, val: `${provider.experienceYears}`,
                  sub: "Years exp.", color: "text-sage" },
                { icon: MapPin,    val: provider.city,
                  sub: "Location", color: "text-navy/50" },
              ].map(({ icon: Icon, val, sub, color }) => (
                <div key={sub}
                  className="bg-white rounded-2xl p-5 border border-black/5
                             shadow-sm text-center">
                  <Icon size={18} className={`${color} mx-auto mb-2`}
                    fill={color === "text-gold" ? "currentColor" : "none"}/>
                  <p className="font-serif text-2xl text-navy">{val}</p>
                  <p className="text-navy/40 text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* About */}
            {provider.description && (
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                <h2 className="font-serif text-2xl text-navy mb-4">About</h2>
                <p className="text-navy/60 leading-relaxed">
                  {provider.description}
                </p>
              </div>
            )}

            {/* Services */}
            {provider.servicesOffered?.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                <h2 className="font-serif text-2xl text-navy mb-5">
                  Services Offered
                </h2>
                <div className="flex flex-wrap gap-2">
                  {provider.servicesOffered.map((s) => (
                    <span key={s}
                      className="px-4 py-2 rounded-full bg-navy/5
                                 text-navy text-sm font-medium
                                 border border-navy/10">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
              <h2 className="font-serif text-2xl text-navy mb-6">
                Reviews
                <span className="text-navy/30 text-base font-outfit
                                 font-normal ml-2">
                  ({reviews.length})
                </span>
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-navy/30">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div key={r.id}
                      className="border-b border-black/5 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-navy/10
                                          flex items-center justify-center">
                            <span className="font-serif text-navy text-sm">
                              {r.customerName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-navy">
                              {r.customerName}
                            </p>
                            <p className="text-navy/30 text-xs">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13}
                              className={i < r.rating
                                ? "text-gold" : "text-navy/10"}
                              fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-navy/60 text-sm leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — booking card */}
          <div className="lg:col-span-1">
            <div className="bg-navy rounded-3xl p-8 sticky top-24">
              <p className="text-cream/50 text-xs uppercase tracking-widest mb-2">
                Hourly Rate
              </p>
              <p className="font-serif text-5xl text-cream mb-1">
                ₹{provider.hourlyRate}
              </p>
              <p className="text-cream/40 text-sm mb-8">per hour</p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Clock, text: "Typically responds in 1 hr" },
                  { icon: BadgeCheck, text: provider.verified
                    ? "Verified Professional" : "Identity Confirmed" },
                  { icon: Calendar, text: "Flexible scheduling" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text}
                    className="flex items-center gap-3 text-cream/60 text-sm">
                    <Icon size={14} className="text-gold flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              <button
                onClick={() => user
                  ? navigate(`/book/${provider.id}`)
                  : navigate("/login")}
                className="w-full py-4 rounded-2xl bg-gold text-navy
                           font-bold hover:bg-cream transition-all
                           duration-300 text-sm tracking-wide mb-3">
                Book Now
              </button>
              <button
                onClick={() => user ? null : navigate("/login")}
                className="w-full py-3.5 rounded-2xl border border-cream/20
                           text-cream text-sm font-medium
                           hover:bg-cream/10 transition">
                Message Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}