// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, LayoutDashboard, Menu, X, Sparkles, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const dashboardLink =
    user?.role === "ADMIN"    ? "/admin" :
    user?.role === "PROVIDER" ? "/provider-dashboard" : "/dashboard";

  const isHome = location.pathname === "/";

  // When not scrolled on home, we might want light text if there's a dark hero,
  // but with our new clean aesthetic, a white/glass header always works well.
  const navbarClasses = scrolled
    ? "bg-white dark:bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md shadow-soft border-b border-slate-100 dark:border-slate-800"
    : "bg-transparent absolute top-0 w-full";

  const textClass = scrolled || !isHome ? "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400" : "text-slate-800 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400";

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-soft border-b border-slate-200/50 dark:border-slate-800 py-2' : 'bg-transparent py-4'}`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            ServiceHub
          </span>
        </Link>

        {/* Desktop nav and Actions */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/browse", label: "Browse Services" },
              { to: "/register", label: "Join Professionals", state: { role: "PROVIDER" } },
            ].map(({ to, label, state }) => (
              <Link
                key={label}
                to={to}
                state={state}
                className={`text-sm font-semibold tracking-wide transition-colors ${textClass}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <>
                <Link
                  to={dashboardLink}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                             bg-primary-50 text-primary-700 text-sm font-semibold
                             hover:bg-primary-100 transition-colors duration-300"
                >
                  <LayoutDashboard size={18} />
                  {user.name.split(" ")[0]}
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:bg-red-900/40 transition-colors duration-300"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-semibold transition px-4 py-2 ${textClass}`}
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-800 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xl px-6 py-6 flex flex-col gap-4 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <Link to="/" className="text-base font-semibold text-slate-700 dark:text-slate-200" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="text-base font-semibold text-slate-700 dark:text-slate-200" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/browse" className="text-base font-semibold text-slate-700 dark:text-slate-200" onClick={() => setMenuOpen(false)}>Browse Services</Link>
          <Link to="/register" state={{ role: "PROVIDER" }} className="text-base font-semibold text-slate-700 dark:text-slate-200" onClick={() => setMenuOpen(false)}>Join Professionals</Link>

          <hr className="border-slate-100 dark:border-slate-800 my-2" />

          {user ? (
            <div className="flex flex-col gap-4">
              <Link to={dashboardLink} className="text-base font-semibold text-primary-600" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-base font-semibold text-red-600 dark:text-red-400">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/login" className="text-base font-semibold text-slate-700" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}