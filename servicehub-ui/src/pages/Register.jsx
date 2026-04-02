// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Sparkles, CheckCircle2, User, Briefcase } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", role: location.state?.role || "CUSTOMER", serviceType: ""
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
      console.log("FORM:", form);
    e.preventDefault();
    setLoading(true);

    console.log("FORM DATA:", form); // 🔥 DEBUG

    try {
      const res = await register(form);
      const data = res.data;

      toast.success("Account created!");
      navigate(data.role === "PROVIDER" ? "/provider-dashboard" : "/dashboard");

    } catch (err) {
      console.log(err.response);
      toast.error(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 dark:bg-slate-950">
      {/* Left — image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-primary-700 opacity-90 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover mix-blend-overlay opacity-60" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-secondary-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 bg-white dark:bg-slate-800/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white dark:bg-slate-800/20 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              ServiceHub
            </span>
          </Link>
          
          <div className="max-w-lg mb-12">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">
              Join India's Premier<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-primary-300">Home Services</span> Marketplace
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "Free to join", desc: "No hidden fees attached" },
                { title: "Get booked fast", desc: "Instant matching with clients" },
                { title: "Verified badge", desc: "Build immediate trust" },
                { title: "Secure payments", desc: "Guaranteed prompt payouts" }
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-secondary-500/20 border border-secondary-400/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={12} className="text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1">{title}</p>
                    <p className="text-primary-200 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800/20 border border-white/10 backdrop-blur-sm" />
              ))}
             </div>
             <span className="text-primary-200 font-medium text-sm">
              <strong className="text-white">850+</strong> professionals already joined
            </span>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      px-6 py-12 lg:py-16 bg-white dark:bg-slate-800 dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md my-auto pb-8">
          
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-10 w-fit">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-primary-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              ServiceHub
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              Create account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Join the ServiceHub community</p>
          </div>

          {/* Role toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 mb-8 border border-slate-200 dark:border-slate-800">
            {[
              { value: "CUSTOMER", label: "I need services", icon: <User size={16} /> },
              { value: "PROVIDER", label: "I offer services", icon: <Briefcase size={16} /> },
            ].map((r) => (
              <button key={r.value} type="button"
                onClick={() => set("role", r.value)}
                className={`flex-1 flex items-center justify-center gap-2
                           py-3 rounded-xl text-sm font-bold transition-all
                           duration-300 ${form.role === r.value
                  ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-soft"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                {r.icon}
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { k: "name",     label: "Full Name",  type: "text",     ph: "John Doe" },
              { k: "email",    label: "Email",       type: "email",    ph: "you@example.com" },
              { k: "phone",    label: "Phone",       type: "tel",      ph: "9876543210" },
              { k: "password", label: "Password",    type: "password", ph: "Min 6 characters" },
            ].map(({ k, label, type, ph }) => (
              <div key={k}>
                <label className="label">{label}</label>
                <input type={type} required
                  value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  placeholder={ph}
                  className="input py-3.5 w-full" />
              </div>
            ))}
            
            {form.role === "PROVIDER" && (
              <div className="animate-fade-in-up">
                <label className="label">Service Category</label>
                <select required 
                  value={form.serviceType} 
                  onChange={(e) => set("serviceType", e.target.value)} 
                  className="input py-3.5 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select your specialty...</option>
                  {[
                     "Electrician", "Plumber", "Cleaner", "Carpenter", 
                     "Painter", "Gardening", "Tutor", "AC Repair", "Pest Control"
                  ].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">This instantly lists you in the marketplace.</p>
              </div>
            )}

            <button type="submit" disabled={loading || (form.role === "PROVIDER" && !form.serviceType)}
              className="w-full btn-primary py-4 text-base font-bold shadow-xl shadow-primary-500/20 disabled:opacity-70 mt-6 transition-all">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium mt-10">
            Already have an account?{" "}
            <Link to="/login"
              className="text-primary-600 font-bold hover:text-primary-700 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}