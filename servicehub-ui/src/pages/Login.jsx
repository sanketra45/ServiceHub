// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success("Welcome back!");
      navigate(data.role === "ADMIN" ? "/admin" :
               data.role === "PROVIDER" ? "/provider-dashboard" : "/dashboard");
    } catch { toast.error("Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 dark:bg-slate-950">
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-900 opacity-90 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover mix-blend-overlay opacity-60" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              ServiceHub
            </span>
          </Link>
          
          <div className="max-w-md">
             <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <CheckCircle2 size={14} className="text-secondary-400" />
                <span className="text-white text-xs font-bold tracking-wide">
                  Top Rated Platform
                </span>
             </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              The best professionals,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-primary-300">at your doorstep.</span>
            </h1>
            <p className="text-primary-100 text-lg font-medium leading-relaxed">
              Trusted by 12,000+ homeowners across India for reliable and fast home services.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-fit mt-8">
            <div className="flex -space-x-4">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop",
              ].map((src, i) => (
                <img key={i} src={src} alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-600 relative" 
                  style={{ zIndex: 3 - i }} />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <span className="text-white text-sm font-semibold">
                +12k trusted users
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white dark:bg-slate-950 relative">
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-10 w-fit">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              ServiceHub
            </span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email Address</label>
              <input type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input py-3.5"
                placeholder="you@example.com" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input py-3.5 pr-12"
                  placeholder="••••••••" />
                <button type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-primary-600 transition-colors">
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-4 text-base font-bold shadow-xl shadow-primary-500/20 disabled:opacity-70 mt-4">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium mt-10">
            Don't have an account?{" "}
            <Link to="/register"
              className="text-primary-600 font-bold hover:text-primary-700 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}