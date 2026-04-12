import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Zap, ArrowRight,
         Star, ShieldCheck, ChevronDown, Sparkles } from "lucide-react";
import { searchProviders, aiRecommend, getProviderCities } from "../api/providers";
import { createEmergency } from "../api/emergency";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ProviderCard from "../components/ProviderCard";

const SERVICES = [
  { name: "Electrician", icon: "⚡",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop" },
  { name: "Plumber",     icon: "🔧",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop" },
  { name: "Cleaner",     icon: "✨",
    img: "/cleaner.png" },
  { name: "Carpenter",   icon: "🪵",
    img: "https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=600&auto=format&fit=crop" },
  { name: "Painter",     icon: "🎨",
    img: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&auto=format&fit=crop" },
  { name: "Gardening",   icon: "🌿",
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop" },
  { name: "Tutor",       icon: "📚",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop" },
  { name: "AC Repair",   icon: "❄️",
    img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop" },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop",
];

const STATS = [
  { value: "12K+", label: "Happy Clients" },
  { value: "850+", label: "Verified Pros" },
  { value: "4.9",  label: "Avg Rating" },
  { value: "98%",  label: "Satisfaction" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serviceType, setServiceType] = useState("");
  const [city, setCity]               = useState("");
  const [providers, setProviders]     = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [heroImg, setHeroImg]         = useState(0);
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    aiRecommend({}).then((r) => setRecommended(r.data)).catch(() => {});
    getProviderCities().then((r) => setAvailableCities(r.data)).catch(() => {});
    const t = setInterval(
      () => setHeroImg((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("tab") === "search") {
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.search]);

  const handleSearch = (svc = serviceType) => {
    let url = "/browse?";
    const params = new URLSearchParams();
    if (svc) params.append("category", svc);
    if (city) params.append("city", city);
    
    navigate(url + params.toString());
  };

  const handleEmergency = async (svc) => {
    if (!user) { navigate("/login"); return; }
    const c = prompt(`Enter your city for emergency ${svc}:`);
    if (!c) return;
    try {
      await createEmergency({ serviceType: svc, city: c });
      toast.success(`🚨 Emergency ${svc} request sent! Provider notified.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "No providers available");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAgMzApIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgoJCQk8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iMSIgZmlsbD0iIzRmNDZlNSIgZmlsbC1vcGFjaXR5PSIwLjEiIC8+CgkJPC9nPgoJPC9zdmc+')] z-0 dark:opacity-20" />
        
        {/* Animated Glow Blobs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-16 py-12">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
              <span className="text-primary-700 dark:text-primary-300 text-xs font-bold tracking-wide">
                India's top rated home services
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
              Expert Home<br/>
              Services, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">On Demand.</span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
              Connect with highly skilled and verified professionals for every home need. Reliable service, transparent pricing, and instant booking.
            </p>

            {/* Glass Search Bar */}
            <div className="bg-white dark:bg-slate-800/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-2.5 flex flex-col md:flex-row gap-2 shadow-xl border border-white dark:border-slate-800 max-w-2xl mx-auto lg:mx-0 mb-8">
              
              {/* Service Dropdown inside search */}
              <div className="flex-1 relative bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 flex items-center gap-3">
                <Search size={18} className="text-primary-500" />
                <div 
                  onClick={() => setOpen(!open)}
                  className="flex-1 py-3.5 cursor-pointer text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-between"
                >
                  {serviceType || "What do you need help with?"}
                  <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                </div>

                {open && (
                  <div className="absolute top-[110%] left-0 w-full bg-white dark:bg-slate-800 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 py-2 max-h-60 overflow-y-auto">
                    <div onClick={() => { setServiceType(""); setOpen(false); }} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
                      All Services
                    </div>
                    {SERVICES.map((s) => (
                      <div key={s.name} onClick={() => { setServiceType(s.name); setOpen(false); }} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span> {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div className="flex-1 relative bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 flex items-center gap-3">
                <MapPin size={18} className="text-primary-500 flex-shrink-0" />
                <div 
                  onClick={() => setCityOpen(!cityOpen)}
                  className="flex-1 py-3.5 cursor-pointer text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-between"
                >
                  {city || "Any City"}
                </div>
                <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                
                {cityOpen && (
                  <div className="absolute top-[110%] left-0 w-full bg-white dark:bg-slate-800 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 py-2 max-h-60 overflow-y-auto">
                     <div onClick={() => { setCity(""); setCityOpen(false); }} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
                      Any City
                    </div>
                    {availableCities.map((c) => (
                      <div key={c} onClick={() => { setCity(c); setCityOpen(false); }} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-3">
                        <MapPin size={14} className="text-slate-400" /> {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button 
                onClick={() => handleSearch()}
                className="btn-primary mt-2 md:mt-0 py-3.5 px-8 md:w-auto w-full text-base"
              >
                Find Pros
              </button>
            </div>

            {/* Quick picks */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 py-1.5 px-2">Popular:</span>
              {["Electrician","Plumber","Cleaner","AC Repair"].map((s) => (
                <button key={s}
                  onClick={() => { setServiceType(s); handleSearch(s); }}
                  className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-md transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right Image/Hero Graphics */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl relative hidden md:block">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] border-8 border-white dark:border-slate-900">
              {HERO_IMAGES.map((src, i) => (
                <img 
                  key={i}
                  src={src} 
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroImg ? "opacity-100" : "opacity-0"}`} 
                />
              ))}
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-white dark:bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white dark:border-slate-800 flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <ShieldCheck className="text-green-600 dark:text-green-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">100% Verified</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Professionals only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white dark:bg-slate-800 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center group">
                <p className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{value}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-1 bg-primary-600 rounded-full" />
              <p className="text-primary-600 text-xs font-bold uppercase tracking-widest">
                What we offer
              </p>
            </div>
            <h2 className="section-title">
              Services tailored <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">for your home</span>
            </h2>
          </div>
          <button onClick={() => navigate("/browse")} className="btn-outline flex items-center gap-2 self-start md:self-auto">
            View all services <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((svc) => (
            <div key={svc.name}
              onClick={() => navigate(`/browse?category=${encodeURIComponent(svc.name)}`)}
              className="card group cursor-pointer border-0 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-40 overflow-hidden relative p-2">
                <img src={svc.img} alt={svc.name} className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-2 bg-gradient-to-t from-slate-900/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-slate-800 flex items-center justify-center text-xl group-hover:bg-primary-100 dark:group-hover:bg-slate-700 transition-colors">
                  {svc.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{svc.name}</h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium group-hover:underline">Explore →</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EMERGENCY SECTION ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="rounded-3xl bg-gradient-to-br from-red-600 to-red-800 overflow-hidden relative shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAgMzApIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgoJCQk8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjUiIC8+CgkJPC9nPgoJPC9zdmc+')] z-0" />
          
          <div className="relative z-10 px-8 py-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/400/30 w-fit px-3 py-1.5 rounded-full border border-red-400/50">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-slate-800 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-100"></span>
                </span>
                <span className="text-red-600 dark:text-red-50 text-xs font-bold uppercase tracking-widest">
                  Emergency Services
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                Need Help Right Now?
              </h2>
              <p className="text-red-100/90 text-lg max-w-xl font-medium">
                Our emergency booking system auto-assigns the nearest verified
                professional to your location — usually arriving within 30 minutes.
              </p>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-3 justify-center md:justify-end">
              {["Electrician","Plumber","AC Repair","Pest Control"].map((s) => (
                <button key={s} onClick={() => handleEmergency(s)}
                  className="px-6 py-4 rounded-xl bg-white dark:bg-slate-800/10 backdrop-blur-md border border-white/20 
                             text-red-700 dark:text-white text-sm font-bold shadow-lg
                             hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-800 dark:hover:text-red-300 transition-all duration-300 flex items-center gap-3">
                  <Zap size={16} className="text-red-600 dark:text-red-300" />
                  Request {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS / RECOMMENDATIONS ── */}
      <section id="results" className="py-16 max-w-7xl mx-auto px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-1 bg-secondary-500 rounded-full" />
              <p className="text-secondary-600 text-xs font-bold uppercase tracking-widest">
                {providers.length > 0 ? "Search Results" : "AI Recommended"}
              </p>
            </div>
            <h2 className="section-title">
              {providers.length > 0
                ? `${providers.length} Professionals Found`
                : "Hand-Picked For You"}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white dark:bg-slate-800 dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {providers.length === 0 && recommended.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No professionals found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  We couldn't find any service providers matching your current search. Try adjusting your filters or location!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(providers.length > 0 ? providers : recommended).map((p) => {
                  return <ProviderCard key={p.id} provider={p} />;
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── WHY PROPAVILION ── */}
      <section className="py-24 bg-white dark:bg-slate-800 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 text-xs font-bold uppercase tracking-widest mb-4">
              Why choose us
            </p>
            <h2 className="section-title">
              The ServiceHub Difference
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck size={32} />,
                title: "Verified Professionals",
                desc: "Every provider passes a rigorous 20-point background check and skill assessment before joining our network.",
                bg: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 dark:bg-blue-900/40 dark:text-blue-400"
              },
              {
                icon: <Zap size={32} />,
                title: "AI-Powered Matching",
                desc: "Our smart algorithm considers rating, experience, distance, and availability to instantly find your perfect match.",
                bg: "bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"
              },
              {
                icon: <Star size={32} />,
                title: "Satisfaction Guaranteed",
                desc: "Not happy? We rebook at zero cost. Your complete satisfaction is our only metric of success.",
                bg: "bg-gold-50 text-amber-500 dark:bg-amber-900/40 dark:text-amber-400"
              },
            ].map(({ icon, title, desc, bg }) => (
              <div key={title}
                className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-900 transition-all duration-300 text-center flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${bg}`}>
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 pt-16 pb-8 px-6 lg:px-8 text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
               <Sparkles className="w-4 h-4 text-white" />
             </div>
             <span className="font-extrabold text-xl tracking-tight text-white">
               ServiceHub
             </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2026 ServiceHub Marketplace. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}