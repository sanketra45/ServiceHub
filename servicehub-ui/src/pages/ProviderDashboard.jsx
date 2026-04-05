// src/pages/ProviderDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { getProviderBookings, updateStatus } from "../api/bookings";
import { getMyProfile, uploadProfilePhoto, uploadWorkImage, createProfile, updateProfile, getProviderAvailability, addProviderSlot, deleteProviderSlot } from "../api/providers";
import { getMyMessages, markMessageAsRead } from "../api/messages";
import { useAuth } from "../context/AuthContext";
import { Upload, Camera, BadgeCheck, Star,
         TrendingUp, Clock, CalendarDays, Trash2, Plus, MessageSquare, Bell } from "lucide-react";
import toast from "react-hot-toast";

const NEXT = { PENDING: "ACCEPTED", ACCEPTED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED" };
const STATUS_DOT = {
  PENDING: "bg-amber-400", ACCEPTED: "bg-blue-400",
  IN_PROGRESS: "bg-violet-400", COMPLETED: "bg-sage dark:bg-emerald-600/90", CANCELLED: "bg-red-400"
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [profile, setProfile]     = useState(null);
  const [workImgs, setWorkImgs]   = useState([]);
  const [tab, setTab]             = useState("bookings");
  const [messages, setMessages]   = useState([]);
  
  const [availability, setAvailability] = useState([]);
  const [slotForm, setSlotForm]   = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  
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
    setWorkImgs(r.data.workImages || []); // ✅ add this line
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
      setTab("profile");
    }
  });
}, []);

  useEffect(() => {
    if (tab === "messages") {
      getMyMessages().then(r => setMessages(r.data)).catch(() => {});
    }
  }, [tab]);

  const handleMarkAsRead = async (id) => {
    try {
      await markMessageAsRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch { /* ignore */ }
  };

useEffect(() => {
  if (profile && tab === "availability") {
    getProviderAvailability(profile.id)
      .then(r => setAvailability(r.data))
      .catch(() => {});
  }
}, [profile, tab]);

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

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setIsAddingSlot(true);
    try {
      const payload = {
        dayOfWeek: slotForm.dayOfWeek,
        startTime: slotForm.startTime.length === 5 ? `${slotForm.startTime}:00` : slotForm.startTime,
        endTime: slotForm.endTime.length === 5 ? `${slotForm.endTime}:00` : slotForm.endTime
      };
      const { data } = await addProviderSlot(payload);
      setAvailability((prev) => [...prev, data]);
      toast.success("Slot added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add slot");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await deleteProviderSlot(id);
      setAvailability((prev) => prev.filter(s => s.id !== id));
      toast.success("Slot removed");
    } catch {
      toast.error("Failed to remove slot");
    }
  };

const handlePhotoUpload = async (e) => {
  if (isNewProfile || !profile) {
    toast.error("Please save your profile settings before uploading a photo.");
    return;
  }
  const file = e.target.files[0];
  if (!file) return;
  try {
    const { data } = await uploadProfilePhoto(file); // ✅ pass file directly
    setProfile((p) => ({ ...p, photoUrl: data.url }));
    toast.success("Profile photo updated!");
  } catch { toast.error("Upload failed"); }
};

const handleWorkUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const { data } = await uploadWorkImage(file); // ✅ pass file directly
    setWorkImgs((prev) => [...prev, data.url]); // ✅ add to gallery
    toast.success("Work photo uploaded!");
  } catch { toast.error("Upload failed"); }
};

  const revenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20">

      {/* Header */}
      <div className="relative bg-navy dark:bg-slate-900 overflow-hidden">
        {profile?.photoUrl && (
          <img src={profile.photoUrl}
            alt="" className="absolute inset-0 w-full h-full object-cover
                              opacity-10" />
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-navy/5 dark:hover:bg-slate-8000
                              border-2 border-gold/30">
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl}
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
                <Camera size={13} className="text-navy dark:text-white" />
              </button>
              <input ref={photoRef} type="file" accept="image/*"
                className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-serif text-3xl text-cream dark:text-slate-100">{user?.name}</h1>
                {profile?.verified && (
                  <BadgeCheck size={18} className="text-gold dark:text-amber-400" />
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
                <Icon size={16} className="text-gold dark:text-amber-400 mb-2" />
                <p className="font-serif text-2xl text-cream dark:text-slate-100">
                  {val}<span className="text-sm text-cream/30">{unit}</span>
                </p>
                <p className="text-cream/40 dark:text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {["profile", "availability", "bookings", "gallery", "messages"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold
                         capitalize transition ${tab === t
                ? "bg-navy dark:bg-slate-900 text-cream dark:text-slate-100"
                : "bg-white dark:bg-slate-800 border border-black/10 dark:border-slate-600 text-navy/50 dark:text-slate-400"}`}>
              {t}
              {t === "messages" && messages.some(m => !m.read) && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
              )}
            </button>
          ))}
        </div>

        {/* Availability tab */}
        {tab === "availability" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-black/5 dark:border-slate-700 shadow-sm">
            <h2 className="font-serif text-2xl text-navy dark:text-white mb-2">Availability Schedule</h2>
            <p className="text-navy/50 dark:text-slate-400 text-sm mb-6">Manage when customers can book you.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-1">
                <form onSubmit={handleAddSlot} className="bg-navy/5 dark:bg-slate-900 border border-navy/10 dark:border-slate-700 p-5 rounded-2xl space-y-4">
                  <h3 className="font-semibold text-navy dark:text-white mb-2">Add New Slot</h3>
                  
                  <div>
                    <label className="label text-xs font-semibold text-navy/70 dark:text-slate-400 mb-1 block">Day of Week</label>
                    <select required value={slotForm.dayOfWeek} onChange={(e) => setSlotForm({...slotForm, dayOfWeek: e.target.value})} className="input py-2.5 w-full rounded-xl px-3 outline-none focus:border-primary-500 text-sm">
                      {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs font-semibold text-navy/70 dark:text-slate-400 mb-1 block">Start Time</label>
                      <input type="time" required value={slotForm.startTime} onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value})} className="input py-2.5 w-full rounded-xl px-3 outline-none focus:border-primary-500 text-sm" />
                    </div>
                    <div>
                      <label className="label text-xs font-semibold text-navy/70 dark:text-slate-400 mb-1 block">End Time</label>
                      <input type="time" required value={slotForm.endTime} onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value})} className="input py-2.5 w-full rounded-xl px-3 outline-none focus:border-primary-500 text-sm" />
                    </div>
                  </div>

                  <button type="submit" disabled={isAddingSlot} className="btn-primary py-2.5 px-4 w-full text-sm flex items-center justify-center gap-2 mt-2">
                    <Plus size={16} /> {isAddingSlot ? "Adding..." : "Add Slot"}
                  </button>
                </form>
              </div>

              {/* Slots List Column */}
              <div className="lg:col-span-2 space-y-3">
                {availability.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-navy/20 dark:border-slate-700 rounded-2xl">
                    <CalendarDays size={32} className="mx-auto text-navy/30 dark:text-slate-600 mb-3" />
                    <p className="text-navy/60 dark:text-slate-400 text-sm">No availability slots added yet.</p>
                  </div>
                ) : (
                  ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => {
                    const daySlots = availability.filter((s) => s.dayOfWeek === day);
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={day} className="border border-navy/10 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800">
                        <h4 className="font-semibold text-navy dark:text-white text-sm mb-3">{day}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {daySlots.map(slot => (
                            <div key={slot.id} className="flex items-center justify-between bg-navy/5 dark:bg-slate-900 border border-navy/10 dark:border-slate-700 rounded-lg px-3 py-2">
                              <span className="text-xs font-medium text-navy/70 dark:text-slate-300">
                                {slot.startTime.substring(0,5)} - {slot.endTime.substring(0,5)}
                              </span>
                              <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-400 hover:text-red-600 transition p-1" title="Remove slot">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings tab */}
        {tab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl
                              border border-black/5 dark:border-slate-700">
                <p className="font-serif text-2xl text-navy/30 dark:text-slate-500">
                  No bookings yet
                </p>
              </div>
            )}
            {bookings.map((b) => (
              <div key={b.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-slate-700
                           shadow-sm overflow-hidden">
                <div className={`h-1 ${STATUS_DOT[b.status] || "bg-gray-200"}`} />
                <div className="p-7">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-xl text-navy dark:text-white mb-1">
                        {b.serviceType}
                      </h3>
                      <p className="text-navy/50 dark:text-slate-400 text-sm">
                        {b.customerName} · {b.bookingDate} at {b.timeSlot}
                      </p>
                      {b.description && (
                        <p className="text-navy/40 dark:text-slate-400 text-sm italic mt-1">
                          "{b.description}"
                        </p>
                      )}
                      <p className="text-navy/40 dark:text-slate-400 text-sm">{b.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl text-navy dark:text-white">
                        ₹{b.totalAmount}
                      </p>
                      <span className={`text-xs font-semibold px-2.5 py-1
                                       rounded-full mt-1 inline-block
                                       ${STATUS_DOT[b.status]
                                         ?.replace("bg-", "bg-")
                                         ?.replace("400", "100")}
                                       text-navy/60 dark:text-slate-300`}>
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
              <h2 className="font-serif text-2xl text-navy dark:text-white">Work Gallery</h2>
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
                <Upload size={36} className="mx-auto mb-4 text-navy/20 dark:text-slate-500
                                             group-hover:text-navy/40 dark:text-slate-400 transition"/>
                <p className="font-serif text-2xl text-navy/30 dark:text-slate-500 mb-2">
                  Upload your work
                </p>
                <p className="text-navy/30 dark:text-slate-500 text-sm">
                  Before & after photos build trust with customers
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {workImgs.map((url, i) => (
                  <div key={i}
                    className="aspect-square rounded-3xl overflow-hidden
                               bg-navy/5 dark:hover:bg-slate-800 group relative">
                    <img src={url}
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
                  <Upload size={24} className="text-navy/20 dark:text-slate-500
                                               group-hover:text-navy/40 dark:text-slate-400 mb-2"/>
                  <span className="text-navy/30 dark:text-slate-500 text-sm">Add more</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-navy dark:text-white">Notifications & Messages</h2>
              <span className="text-sm text-navy/50 dark:text-slate-400">
                {messages.filter(m => !m.read).length} unread
              </span>
            </div>
            
            {messages.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-slate-700">
                <Bell size={40} className="mx-auto text-navy/20 dark:text-slate-600 mb-4" />
                <p className="font-serif text-xl text-navy/30 dark:text-slate-500">No messages yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {messages.map((m) => (
                  <div key={m.id} 
                    className={`p-5 rounded-2xl border transition group ${m.read 
                      ? "bg-white/50 dark:bg-slate-800/50 border-black/5 dark:border-slate-700 opacity-80" 
                      : "bg-white dark:bg-slate-800 border-gold/20 dark:border-amber-900/30 shadow-sm"}`}>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.read ? "bg-navy/5 dark:bg-slate-700" : "bg-gold/10 dark:bg-amber-900/20"}`}>
                        <MessageSquare size={18} className={m.read ? "text-navy/30 dark:text-slate-500" : "text-gold dark:text-amber-400"} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-semibold text-sm ${m.read ? "text-navy/60 dark:text-slate-400" : "text-navy dark:text-white"}`}>
                            {m.senderName || "System Notification"}
                          </h4>
                          <span className="text-[10px] text-navy/30 dark:text-slate-500 font-medium">
                            {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${m.read ? "text-navy/40 dark:text-slate-500" : "text-navy/70 dark:text-slate-300"}`}>
                          {m.content}
                        </p>
                        {!m.read && (
                          <button 
                            onClick={() => handleMarkAsRead(m.id)}
                            className="text-xs font-bold text-gold dark:text-amber-400 hover:underline transition">
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "profile" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-black/5 dark:border-slate-700 shadow-sm">
            <h2 className="font-serif text-2xl text-navy dark:text-white mb-2">Profile Settings</h2>
            <p className="text-navy/50 dark:text-slate-400 text-sm mb-6">Complete your profile to appear in search results.</p>
            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label text-sm font-semibold text-navy/70 dark:text-slate-400 mb-1.5 block">Service Type</label>
                  <select required value={profileForm.serviceType} onChange={(e) => setProfileForm({...profileForm, serviceType: e.target.value})} className="input py-3 w-full rounded-xl px-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select Service</option>
                    {["Electrician", "Plumber", "Cleaner", "Carpenter", "Painter", "Gardening", "Tutor", "AC Repair", "Pest Control"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-sm font-semibold text-navy/70 dark:text-slate-400 mb-1.5 block">City</label>
                  <input type="text" required value={profileForm.city} onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} className="input py-3 w-full rounded-xl px-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="e.g. Mumbai" />
                </div>
                <div>
                  <label className="label text-sm font-semibold text-navy/70 dark:text-slate-400 mb-1.5 block">Hourly Rate (₹)</label>
                  <input type="number" required min="0" value={profileForm.hourlyRate} onChange={(e) => setProfileForm({...profileForm, hourlyRate: e.target.value})} className="input py-3 w-full rounded-xl px-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="label text-sm font-semibold text-navy/70 dark:text-slate-400 mb-1.5 block">Experience (Years)</label>
                  <input type="number" required min="0" value={profileForm.experienceYears} onChange={(e) => setProfileForm({...profileForm, experienceYears: e.target.value})} className="input py-3 w-full rounded-xl px-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="e.g. 5" />
                </div>
              </div>
              <div>
                <label className="label text-sm font-semibold text-navy/70 dark:text-slate-400 mb-1.5 block">Description</label>
                <textarea rows="4" required value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} className="input py-3 w-full rounded-xl px-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Tell customers about your expertise..." />
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