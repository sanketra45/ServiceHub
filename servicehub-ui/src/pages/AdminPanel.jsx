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
    PENDING: "bg-amber-50 text-amber-700",
    ACCEPTED: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <div className="min-h-screen bg-cream pt-20">

      {/* Header */}
      <div className="bg-navy px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gold text-xs uppercase tracking-widest mb-2">
            Admin
          </p>
          <h1 className="font-serif text-4xl text-cream">Control Center</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {["overview","users","providers","bookings"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold
                         capitalize transition ${tab === t
                ? "bg-navy text-cream"
                : "bg-white border border-black/10 text-navy/50"}`}>
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
                  val: stats.totalUsers,      bg: "bg-blue-50",  ic: "text-blue-600" },
                { icon: BookOpen,    label: "Total Bookings",
                  val: stats.totalBookings,   bg: "bg-violet-50",ic: "text-violet-600" },
                { icon: CheckCircle, label: "Completed",
                  val: stats.completedBookings, bg: "bg-green-50", ic: "text-green-600"},
                { icon: TrendingUp,  label: "Revenue",
                  val: `₹${Math.round(stats.totalRevenue || 0).toLocaleString()}`,
                  bg: "bg-amber-50", ic: "text-amber-600" },
              ].map(({ icon: Icon, label, val, bg, ic }) => (
                <div key={label}
                  className="bg-white rounded-3xl p-7 border border-black/5
                             shadow-sm">
                  <div className={`${bg} w-11 h-11 rounded-2xl flex
                                   items-center justify-center mb-5`}>
                    <Icon size={20} className={ic} />
                  </div>
                  <p className="font-serif text-3xl text-navy mb-1">{val}</p>
                  <p className="text-navy/40 text-sm">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-navy rounded-3xl p-7 text-center">
                <BarChart3 size={20} className="text-gold mx-auto mb-3" />
                <p className="font-serif text-4xl text-cream mb-1">
                  {stats.verifiedProviders}
                </p>
                <p className="text-cream/40 text-sm">Verified Providers</p>
              </div>
              <div className="bg-white rounded-3xl p-7 text-center
                              border border-black/5 shadow-sm">
                <p className="text-navy/40 text-xs uppercase tracking-widest mb-3">
                  Top Service
                </p>
                <p className="font-serif text-3xl text-navy">
                  {stats.topServiceType}
                </p>
              </div>
              <div className="bg-gold/10 rounded-3xl p-7 text-center
                              border border-gold/20">
                <p className="text-gold/60 text-xs uppercase tracking-widest mb-3">
                  Pending Approvals
                </p>
                <p className="font-serif text-4xl text-navy">
                  {providers.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="bg-white rounded-3xl border border-black/5
                          shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-black/5">
              <h2 className="font-serif text-xl text-navy">
                All Users ({users.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    {["Name","Email","Role","Status","Actions"].map((h) => (
                      <th key={h}
                        className="px-7 py-4 text-left text-xs font-semibold
                                   uppercase tracking-widest text-navy/30">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {users.map((u) => (
                    <tr key={u.id}
                      className="hover:bg-cream/50 transition">
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy/10
                                          flex items-center justify-center">
                            <span className="font-serif text-navy text-sm">
                              {u.name?.[0]}
                            </span>
                          </div>
                          <span className="font-medium text-sm text-navy">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-4 text-navy/50 text-sm">
                        {u.email}
                      </td>
                      <td className="px-7 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs
                                         font-semibold
                          ${u.role === "ADMIN"
                            ? "bg-violet-50 text-violet-700"
                            : u.role === "PROVIDER"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-green-50 text-green-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-7 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs
                                         font-semibold
                          ${u.enabled
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"}`}>
                          {u.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggle(u.id)}
                            className="px-3 py-1.5 rounded-lg border
                                       border-black/10 text-navy/60 text-xs
                                       font-medium hover:bg-navy/5 transition">
                            {u.enabled ? "Disable" : "Enable"}
                          </button>
                          <button onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50
                                       text-navy/20 hover:text-red-500
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
              <div className="text-center py-20 bg-white rounded-3xl
                              border border-black/5">
                <ShieldCheck size={32} className="mx-auto text-sage mb-3" />
                <p className="font-serif text-2xl text-navy/30">
                  All caught up!
                </p>
                <p className="text-navy/30 text-sm mt-1">
                  No pending providers
                </p>
              </div>
            )}
            {providers.map((p) => (
              <div key={p.id}
                className="bg-white rounded-3xl border border-black/5
                           shadow-sm p-7 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-cream overflow-hidden">
                    {p.photoUrl ? (
                      <img src={`http://localhost:8080${p.photoUrl}`}
                        alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center
                                      justify-center">
                        <span className="font-serif text-xl text-navy/30">
                          {p.name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-navy">{p.name}</h3>
                    <p className="text-navy/50 text-sm">
                      {p.serviceType} · {p.city} ·{" "}
                      {p.experienceYears}y exp · ₹{p.hourlyRate}/hr
                    </p>
                    <p className="text-navy/30 text-xs mt-0.5">{p.email}</p>
                  </div>
                </div>
                <button onClick={() => handleVerify(p.id)}
                  className="flex items-center gap-2 bg-sage text-cream
                             px-5 py-2.5 rounded-xl font-semibold text-sm
                             hover:bg-sage/80 transition">
                  <ShieldCheck size={15} /> Verify
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bookings */}
        {tab === "bookings" && (
          <div className="bg-white rounded-3xl border border-black/5
                          shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-black/5">
              <h2 className="font-serif text-xl text-navy">
                All Bookings ({bookings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    {["#","Customer","Provider","Service",
                      "Date","Status","Amount"].map((h) => (
                      <th key={h}
                        className="px-6 py-4 text-left text-xs font-semibold
                                   uppercase tracking-widest text-navy/30">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-cream/50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-navy/30">
                        {b.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-navy">
                        {b.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy/60">
                        {b.providerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy/60">
                        {b.serviceType}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy/40">
                        {b.bookingDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs
                                         font-semibold
                                         ${STATUS_COLOR[b.status]}`}>
                          {b.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-serif text-navy">
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