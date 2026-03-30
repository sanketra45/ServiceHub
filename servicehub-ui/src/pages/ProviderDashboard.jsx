// src/pages/ProviderDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { getProviderBookings, updateStatus } from "../api/bookings";
import { getMyProfile, uploadProfilePhoto, uploadWorkImage, createProfile, updateProfile } from "../api/providers";
import { useAuth } from "../context/AuthContext";
import { Upload, Camera, BadgeCheck, Star,
         TrendingUp, Clock } from "lucide-react";
import toast from "react-hot-toast";

const NEXT = { PENDING: "ACCEPTED", ACCEPTED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED" };
const STATUS_DOT = {
  PENDING: "bg-amber-400", ACCEPTED: "bg-blue-400",
  IN_PROGRESS: "bg-violet-400", COMPLETED: "bg-sage", CANCELLED: "bg-red-400"
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [profile, setProfile]     = useState(null);
  const [workImgs, setWorkImgs]   = useState([]);
  const [tab, setTab]             = useState("bookings");
  
  const [profileForm, setProfileForm] = useState({
    serviceType: "", city: "", hourlyRate: "", experienceYears: "", description: ""
  });
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const photoRef = useRef();
  const workRef  = useRef();

  useEffect(() => {
    getProviderBookings().then((r) => setBookings(r.data)).catch(() => {});
    getMyProfile().then((r) => {
      setProfile(r.data);
      if (r.data) {
        setProfileForm({
          serviceType: r.data.serviceType || "",
          city: r.data.city || "",
          hourlyRate: r.data.hourlyRate || "",
          experienceYears: r.data.experienceYears || "",
          description: r.data.description || ""
        });
      }
    }).catch((err) => {
      if (err.response?.status === 404 || err.response?.status === 400 || !profile) {
        setIsNewProfile(true);
        // Default to profile tab if they are new to encourage completion
        setTab("profile");
      }
    });
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload = {
        serviceType: profileForm.serviceType,
        city: profileForm.city,
        hourlyRate: Number(profileForm.hourlyRate),
        experienceYears: Number(profileForm.experienceYears),
        description: profileForm.description,
      };
      
      let res;
      if (isNewProfile) {
        res = await createProfile(payload);
        setIsNewProfile(false);
      } else {
        res = await updateProfile(payload);
      }
      setProfile(res.data);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStatusUpdate = async (id, s) => {
    try {
      const { data } = await updateStatus(id, s);
      setBookings((b) => b.map((x) => x.id === id ? data : x));
      toast.success(`Marked as ${s.replace("_", " ")}`);
    } catch { toast.error("Update failed"); }
  };

  const handlePhotoUpload = async (e) => {
    if (isNewProfile || !profile) {
      toast.error("Please save your profile settings before uploading a photo.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    try {
      const { data } = await uploadProfilePhoto(fd);
      setProfile((p) => ({ ...p, photoUrl: data.url }));
      toast.success("Profile photo updated!");
    } catch { toast.error("Upload failed"); }
  };

  const handleWorkUpload = async (e) => {
    if (isNewProfile || !profile) {
      toast.error("Please save your profile settings before uploading work images.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    try {
      const { data } = await uploadWorkImage(fd);
      setWorkImgs((w) => [...w, data.url]);
      toast.success("Image uploaded!");
    } catch { toast.error("Upload failed"); }
  };

  const revenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-cream pt-20">

      {/* Header */}
      <div className="relative bg-navy overflow-hidden">
        {profile?.photoUrl && (
          <img src={`http://localhost:8080${profile.photoUrl}`}
            alt="" className="absolute inset-0 w-full h-full object-cover
                              opacity-10" />
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-navy/50
                              border-2 border-gold/30">
                {profile?.photoUrl ? (
                  <img src={`http://localhost:8080${profile.photoUrl}`}
                    alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-3xl text-gold/50">
                      {user?.name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={() => photoRef.current.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                           bg-gold flex items-center justify-center shadow-lg">
                <Camera size={13} className="text-navy" />
              </button>
              <input ref={photoRef} type="file" accept="image/*"
                className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-serif text-3xl text-cream">{user?.name}</h1>
                {profile?.verified && (
                  <BadgeCheck size={18} className="text-gold" />
                )}
              </div>
              <p className="text-cream/50">{profile?.serviceType}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Star,      label: "Rating",
                val: profile?.averageRating?.toFixed(1) || "—", unit: "/5" },
              { icon: TrendingUp, label: "Revenue",
                val: `₹${revenue.toFixed(0)}`, unit: "" },
              { icon: Clock,     label: "Total Jobs",
                val: bookings.length, unit: "" },
              { icon: BadgeCheck, label: "Completed",
                val: bookings.filter((b) =>
                  b.status === "COMPLETED").length, unit: "" },
            ].map(({ icon: Icon, label, val, unit }) => (
              <div key={label}
                className="bg-cream/5 border border-cream/10 rounded-2xl p-5">
                <Icon size={16} className="text-gold mb-2" />
                <p className="font-serif text-2xl text-cream">
                  {val}<span className="text-sm text-cream/30">{unit}</span>
                </p>
                <p className="text-cream/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex gap-2 mb-8">
          {["profile", "bookings", "gallery"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold
                         capitalize transition ${tab === t
                ? "bg-navy text-cream"
                : "bg-white border border-black/10 text-navy/50"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Bookings tab */}
        {tab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl
                              border border-black/5">
                <p className="font-serif text-2xl text-navy/30">
                  No bookings yet
                </p>
              </div>
            )}
            {bookings.map((b) => (
              <div key={b.id}
                className="bg-white rounded-3xl border border-black/5
                           shadow-sm overflow-hidden">
                <div className={`h-1 ${STATUS_DOT[b.status] || "bg-gray-200"}`} />
                <div className="p-7">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-xl text-navy mb-1">
                        {b.serviceType}
                      </h3>
                      <p className="text-navy/50 text-sm">
                        {b.customerName} · {b.bookingDate} at {b.timeSlot}
                      </p>
                      {b.description && (
                        <p className="text-navy/40 text-sm italic mt-1">
                          "{b.description}"
                        </p>
                      )}
                      <p className="text-navy/40 text-sm">{b.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl text-navy">
                        ₹{b.totalAmount}
                      </p>
                      <span className={`text-xs font-semibold px-2.5 py-1
                                       rounded-full mt-1 inline-block
                                       ${STATUS_DOT[b.status]
                                         ?.replace("bg-", "bg-")
                                         ?.replace("400", "100")}
                                       text-navy/60`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {NEXT[b.status] && (
                    <button onClick={() => handleStatusUpdate(b.id, NEXT[b.status])}
                      className="btn-primary text-sm py-2.5">
                      Mark as {NEXT[b.status].replace("_", " ")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery tab */}
        {tab === "gallery" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-navy">Work Gallery</h2>
              <button onClick={() => workRef.current.click()}
                className="flex items-center gap-2 btn-primary text-sm py-2.5">
                <Upload size={14} /> Upload Photo
              </button>
              <input ref={workRef} type="file" accept="image/*"
                className="hidden" onChange={handleWorkUpload} />
            </div>

            {workImgs.length === 0 ? (
              <div
                onClick={() => workRef.current.click()}
                className="border-2 border-dashed border-navy/15 rounded-4xl
                           p-20 text-center cursor-pointer
                           hover:border-navy/30 transition group">
                <Upload size={36} className="mx-auto mb-4 text-navy/20
                                             group-hover:text-navy/40 transition"/>
                <p className="font-serif text-2xl text-navy/30 mb-2">
                  Upload your work
                </p>
                <p className="text-navy/30 text-sm">
                  Before & after photos build trust with customers
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {workImgs.map((url, i) => (
                  <div key={i}
                    className="aspect-square rounded-3xl overflow-hidden
                               bg-navy/5 group relative">
                    <img src={`http://localhost:8080${url}`}
                      alt={`Work ${i + 1}`}
                      className="w-full h-full object-cover
                                 group-hover:scale-105 transition-transform
                                 duration-500" />
                  </div>
                ))}
                <div
                  onClick={() => workRef.current.click()}
                  className="aspect-square rounded-3xl border-2 border-dashed
                             border-navy/15 flex flex-col items-center
                             justify-center cursor-pointer
                             hover:border-navy/30 transition group">
                  <Upload size={24} className="text-navy/20
                                               group-hover:text-navy/40 mb-2"/>
                  <span className="text-navy/30 text-sm">Add more</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
            <h2 className="font-serif text-2xl text-navy mb-2">Profile Settings</h2>
            <p className="text-navy/50 text-sm mb-6">Complete your profile to appear in search results.</p>
            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label text-sm font-semibold text-navy/70 mb-1.5 block">Service Type</label>
                  <select required value={profileForm.serviceType} onChange={(e) => setProfileForm({...profileForm, serviceType: e.target.value})} className="input py-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select Service</option>
                    {["Electrician", "Plumber", "Cleaner", "Carpenter", "Painter", "Gardening", "Tutor", "AC Repair", "Pest Control"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-sm font-semibold text-navy/70 mb-1.5 block">City</label>
                  <input type="text" required value={profileForm.city} onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} className="input py-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="e.g. Mumbai" />
                </div>
                <div>
                  <label className="label text-sm font-semibold text-navy/70 mb-1.5 block">Hourly Rate (₹)</label>
                  <input type="number" required min="0" value={profileForm.hourlyRate} onChange={(e) => setProfileForm({...profileForm, hourlyRate: e.target.value})} className="input py-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="label text-sm font-semibold text-navy/70 mb-1.5 block">Experience (Years)</label>
                  <input type="number" required min="0" value={profileForm.experienceYears} onChange={(e) => setProfileForm({...profileForm, experienceYears: e.target.value})} className="input py-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="e.g. 5" />
                </div>
              </div>
              <div>
                <label className="label text-sm font-semibold text-navy/70 mb-1.5 block">Description</label>
                <textarea rows="4" required value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} className="input py-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Tell customers about your expertise..." />
              </div>
              <button type="submit" disabled={isSavingProfile} className="btn-primary py-3 px-8 mt-4 w-full md:w-auto">
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}