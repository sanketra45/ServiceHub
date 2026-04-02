// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import { getStats, getAllUsers, toggleUser, deleteUser,
         getPendingProviders, verifyProvider,
         getAllBookings } from "../api/admin";
import { Users, BookOpen, TrendingUp,
         CheckCircle, Trash2, ShieldCheck,
         BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPanel() {
  const [tab, setTab]           = useState("overview");
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    Promise.all([getStats(), getAllUsers(),
                 getPendingProviders(), getAllBookings()])
      .then(([s, u, p, b]) => {
        setStats(s.data); setUsers(u.data);
        setProviders(p.data); setBookings(b.data);
      });
  }, []);

  const handleToggle = async (id) => {
    const { data } = await toggleUser(id);
    setUsers((u) => u.map((x) => x.id === id ? data : x));
    toast.success("User updated");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    await deleteUser(id);
    setUsers((u) => u.filter((x) => x.id !== id));
    toast.success("User deleted");
  };

  const handleVerify = async (id) => {
    await verifyProvider(id);
    setProviders((p) => p.filter((x) => x.id !== id));
    toast.success("Provider verified!");
  };

  const STATUS_COLOR = {
    PENDING: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    ACCEPTED: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    IN_PROGRESS: "bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    COMPLETED: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    CANCELLED: "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20">

      {/* Header */}
      <div className="bg-navy dark:bg-slate-900 px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gold dark:text-amber-400 text-xs uppercase tracking-widest mb-2">
            Admin
          </p>
          <h1 className="font-serif text-4xl text-cream dark:text-white">Control Center</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {["overview","users","providers","bookings"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold
                         capitalize transition ${tab === t
                ? "bg-navy dark:bg-slate-900 text-cream dark:text-slate-100 dark:bg-slate-700 dark:text-white"
                : "bg-white dark:bg-slate-800 border border-black/10 dark:border-slate-700 text-navy/50 dark:text-slate-400"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users,       label: "Total Users",
                  val: stats.totalUsers,      bg: "bg-blue-50 dark:bg-blue-900/40",  ic: "text-blue-600 dark:text-blue-400" },
                { icon: BookOpen,    label: "Total Bookings",
                  val: stats.totalBookings,   bg: "bg-violet-50 dark:bg-violet-900/40",ic: "text-violet-600 dark:text-violet-400" },
                { icon: CheckCircle, label: "Completed",
                  val: stats.completedBookings, bg: "bg-green-50 dark:bg-green-900/40", ic: "text-green-600 dark:text-green-400"},
                { icon: TrendingUp,  label: "Revenue",
                  val: `₹${Math.round(stats.totalRevenue || 0).toLocaleString()}`,
                  bg: "bg-amber-50 dark:bg-amber-900/40", ic: "text-amber-600 dark:text-amber-400" },
              ].map(({ icon: Icon, label, val, bg, ic }) => (
                <div key={label}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-7 border border-black/5 dark:border-slate-700
                             shadow-sm">
                  <div className={`${bg} w-11 h-11 rounded-2xl flex
                                   items-center justify-center mb-5`}>
                    <Icon size={20} className={ic} />
                  </div>
                  <p className="font-serif text-3xl text-navy dark:text-white mb-1">{val}</p>
                  <p className="text-navy/40 dark:text-slate-400 text-sm">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-navy dark:bg-slate-800 rounded-3xl p-7 text-center">
                <BarChart3 size={20} className="text-gold dark:text-amber-400 mx-auto mb-3" />
                <p className="font-serif text-4xl text-cream dark:text-white mb-1">
                  {stats.verifiedProviders}
                </p>
                <p className="text-cream/40 dark:text-slate-400 text-sm">Verified Providers</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-7 text-center
                              border border-black/5 dark:border-slate-700 shadow-sm">
                <p className="text-navy/40 dark:text-slate-400 text-xs uppercase tracking-widest mb-3">
                  Top Service
                </p>
                <p className="font-serif text-3xl text-navy dark:text-white">
                  {stats.topServiceType}
                </p>
              </div>
              <div className="bg-gold/10 dark:bg-amber-900/20 rounded-3xl p-7 text-center
                              border border-gold/20 dark:border-amber-500/20">
                <p className="text-gold/60 dark:text-amber-500/80 text-xs uppercase tracking-widest mb-3">
                  Pending Approvals
                </p>
                <p className="font-serif text-4xl text-navy dark:text-white">
                  {providers.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-slate-700
                          shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-black/5 dark:border-slate-700">
              <h2 className="font-serif text-xl text-navy dark:text-white">
                All Users ({users.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 dark:border-slate-700">
                    {["Name","Email","Role","Status","Actions"].map((h) => (
                      <th key={h}
                        className="px-7 py-4 text-left text-xs font-semibold
                                   uppercase tracking-widest text-navy/30 dark:text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id}
                      className="hover:bg-cream/50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-slate-700
                                          flex items-center justify-center">
                            <span className="font-serif text-navy dark:text-white text-sm">
                              {u.name?.[0]}
                            </span>
                          </div>
                          <span className="font-medium text-sm text-navy dark:text-white">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-4 text-navy/50 dark:text-slate-400 text-sm">
                        {u.email}
                      </td>
                      <td className="px-7 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs
                                         font-semibold
                          ${u.role === "ADMIN"
                            ? "bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 dark:bg-violet-900/40 dark:text-violet-300"
                            : u.role === "PROVIDER"
                              ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 dark:bg-blue-900/40 dark:text-blue-300"
                              : "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 dark:bg-green-900/40 dark:text-green-300"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-7 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs
                                         font-semibold
                          ${u.enabled
                            ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 dark:bg-red-900/40 dark:text-red-300"}`}>
                          {u.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggle(u.id)}
                            className="px-3 py-1.5 rounded-lg border
                                       border-black/10 dark:border-slate-600 text-navy/60 dark:text-slate-300 text-xs
                                       font-medium hover:bg-navy/5 dark:hover:bg-slate-700 transition">
                            {u.enabled ? "Disable" : "Enable"}
                          </button>
                          <button onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:bg-red-900/40 dark:hover:bg-red-900/30
                                       text-navy/20 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400
                                       transition">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Providers */}
        {tab === "providers" && (
          <div className="space-y-4">
            {providers.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl
                              border border-black/5 dark:border-slate-700">
                <ShieldCheck size={32} className="mx-auto text-sage dark:text-emerald-500 mb-3" />
                <p className="font-serif text-2xl text-navy/30 dark:text-slate-500">
                  All caught up!
                </p>
                <p className="text-navy/30 dark:text-slate-500 text-sm mt-1">
                  No pending providers
                </p>
              </div>
            )}
            {providers.map((p) => (
              <div key={p.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-slate-700
                           shadow-sm p-7 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-cream dark:bg-slate-950 dark:bg-slate-700 overflow-hidden">
                    {p.photoUrl ? (
                      <img src={`http://localhost:8080${p.photoUrl}`}
                        alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center
                                      justify-center">
                        <span className="font-serif text-xl text-navy/30 dark:text-slate-400">
                          {p.name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-navy dark:text-white">{p.name}</h3>
                    <p className="text-navy/50 dark:text-slate-400 text-sm">
                      {p.serviceType} · {p.city} ·{" "}
                      {p.experienceYears}y exp · ₹{p.hourlyRate}/hr
                    </p>
                    <p className="text-navy/30 dark:text-slate-500 text-xs mt-0.5">{p.email}</p>
                  </div>
                </div>
                <button onClick={() => handleVerify(p.id)}
                  className="flex items-center gap-2 bg-sage dark:bg-emerald-600/90 text-cream dark:text-white
                             px-5 py-2.5 rounded-xl font-semibold text-sm
                             hover:bg-sage/80 dark:hover:bg-emerald-600 transition">
                  <ShieldCheck size={15} /> Verify
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bookings */}
        {tab === "bookings" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-slate-700
                          shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-black/5 dark:border-slate-700">
              <h2 className="font-serif text-xl text-navy dark:text-white">
                All Bookings ({bookings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5 dark:border-slate-700">
                    {["#","Customer","Provider","Service",
                      "Date","Status","Amount"].map((h) => (
                      <th key={h}
                        className="px-6 py-4 text-left text-xs font-semibold
                                   uppercase tracking-widest text-navy/30 dark:text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-slate-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-cream/50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-navy/30 dark:text-slate-500">
                        {b.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-navy dark:text-white">
                        {b.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy/60 dark:text-slate-300">
                        {b.providerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy/60 dark:text-slate-300">
                        {b.serviceType}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy/40 dark:text-slate-400">
                        {b.bookingDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs
                                         font-semibold
                                         ${STATUS_COLOR[b.status]}`}>
                          {b.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-serif text-navy dark:text-white">
                        ₹{b.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}