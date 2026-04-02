import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, MapPin, Star, BadgeCheck,
  ChevronDown, SlidersHorizontal, X,
  ArrowRight, Users, Sparkles
} from "lucide-react";
import { searchProviders } from "../api/providers";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "all", label: "All Services", icon: "🏡" },
  { id: "Electrician", label: "Electrician", icon: "⚡", desc: "Wiring, panels, lighting & smart home" },
  { id: "Plumber", label: "Plumber", icon: "🔧", desc: "Pipes, fittings, leaks & drainage" },
  { id: "Cleaner", label: "Cleaner", icon: "✨", desc: "Deep cleaning, sanitization & organizing" },
  { id: "Carpenter", label: "Carpenter", icon: "🪵", desc: "Custom furniture, cabinetry & woodwork" },
  { id: "Painter", label: "Painter", icon: "🎨", desc: "Interior, exterior & mural work" },
  { id: "Gardening", label: "Gardening", icon: "🌿", desc: "Landscaping, lawn care & plant styling" },
  { id: "Tutor", label: "Tutor", icon: "📚", desc: "Academic support & skill development" },
  { id: "AC Repair", label: "AC Repair", icon: "❄️", desc: "HVAC maintenance, installation & repair" },
  { id: "Mechanic", label: "Mechanic", icon: "🔩", desc: "Vehicle diagnostics & on-site repairs" },
  { id: "Pest Control", label: "Pest Control", icon: "🛡️", desc: "Humane removal & preventative barriers" },
  { id: "Appliances", label: "Appliances", icon: "🏠", desc: "Fridge, washing machine & smart devices" },
];

const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop",
];

function ProviderCard({ provider, navigate }) {
  const imgUrl = provider.photoUrl 
    ? `http://localhost:8080${provider.photoUrl}`
    : FALLBACK_IMGS[(provider.id || 0) % FALLBACK_IMGS.length];

  return (
    <div 
      onClick={() => navigate(`/provider/${provider.id}`)}
      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-900 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={imgUrl} 
          alt={provider.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        {provider.verified && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 text-green-600 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
            <BadgeCheck size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1.5">{provider.name}</h3>
          <div className="inline-flex items-center gap-1.5 bg-primary-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold border border-primary-500/50">
            <span>{CATEGORIES.find(c => c.id === provider.serviceType)?.icon || "🛠️"}</span>
            {provider.serviceType}
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-900 dark:text-white">
              {provider.averageRating?.toFixed(1) || "New"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              ({provider.totalReviews || 0})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <MapPin size={14} />
            {provider.city || "Remote"}
          </div>
        </div>

        {provider.experienceYears > 0 && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
            {provider.experienceYears} years experience
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{provider.hourlyRate}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/hr</span>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white transition-colors">
            Book <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ filters, setFilters, onApply, onClose }) {
  const [local, setLocal] = useState(filters);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-left">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal size={20} /> Refine Search
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">City</label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
              <MapPin size={18} className="text-slate-400" />
              <input 
                className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Where do you need service?"
                value={local.city}
                onChange={e => setLocal({...local, city: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Minimum Rating</label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 3, 3.5, 4, 4.5].map(r => (
                <button
                  key={r}
                  onClick={() => setLocal({...local, minRating: r})}
                  className={`py-2 rounded-xl text-sm font-bold transition-colors ${local.minRating === r ? "bg-primary-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Max Price / Hour</label>
            <div className="grid grid-cols-5 gap-2">
              {[null, 200, 500, 1000, 2000].map(p => (
                <button
                  key={p}
                  onClick={() => setLocal({...local, maxPrice: p})}
                  className={`py-2 rounded-xl text-sm font-bold transition-colors ${local.maxPrice === p ? "bg-primary-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}
                >
                  {p === null ? "Any" : `₹${p}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sort By</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: "rating", label: "Highest Rated" },
                { val: "price", label: "Lowest Price" },
                { val: "experience", label: "Most Experience" },
              ].map(({val, label}) => (
                <button
                  key={val}
                  onClick={() => setLocal({...local, sortBy: val})}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${local.sortBy === val ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
          <button 
            onClick={() => { setLocal({ city: "", minRating: 0, maxPrice: null, sortBy: "rating" }); }}
            className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Clear All
          </button>
          <button 
            onClick={() => { setFilters(local); onApply(local); onClose(); }}
            className="flex-[2] btn-primary py-3.5 shadow-lg shadow-primary-500/30"
          >
            Show Results
          </button>
        </div>
      </div>
      <style>{`@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}</style>
    </div>
  );
}

export default function BrowseServices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    minRating: 0,
    maxPrice: null,
    sortBy: "rating",
  });

  useEffect(() => { fetchProviders(filters); }, []);

  const fetchProviders = async (f = filters) => {
    setLoading(true);
    try {
      const { data } = await searchProviders({
        city: f.city || undefined,
        minRating: f.minRating || undefined,
        maxPrice: f.maxPrice || undefined,
        sortBy: f.sortBy || "rating",
      });
      let providers = Array.isArray(data) ? data : (data.content || []);
      // Sanitize mismatched legacy database entries
      providers = providers.map(p => ({
        ...p,
        serviceType: p.serviceType?.toLowerCase() === "gardner" ? "Gardening" : p.serviceType 
      }));
      setAllProviders(providers);
    } catch {
      toast.error("Failed to load providers.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProviders = () => {
    let result = [...allProviders];
    if (activeCategory !== "all") {
      result = result.filter(p => p.serviceType?.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.city?.toLowerCase().includes(q) || 
        p.serviceType?.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const grouped = {};
  if (activeCategory === "all" && !searchQuery) {
    allProviders.forEach(p => {
      const type = p.serviceType || "Other Services";
      const catMatch = CATEGORIES.find(c => c.id.toLowerCase() === type.toLowerCase());
      const catId = catMatch ? catMatch.id : type;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(p);
    });
  }

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setSearchQuery("");
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (catId === "all") next.delete("category");
      else next.set("category", catId);
      return next;
    });
  };

  const filtered = getFilteredProviders();
  const isAllView = activeCategory === "all" && !searchQuery.trim();
  const activeFiltersCount = [filters.city, filters.minRating > 0, filters.maxPrice !== null, filters.sortBy !== "rating"].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 flex flex-col">
      {/* Header Area */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={14} /> Service Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Experts.</span>
              </h1>
            </div>
            
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 flex-1 md:w-80 border border-slate-200 dark:border-slate-700 focus-within:border-primary-500 transition-colors">
                <Search size={18} className="text-slate-400" />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search providers or city..."
                  className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowFilter(true)}
                className={`flex items-center gap-2 px-5 rounded-2xl text-sm font-bold transition-all border ${activeFiltersCount > 0 ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-primary-700 text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${isActive ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <span className="text-lg leading-none">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[360px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <>
            {isAllView ? (
              <div className="space-y-16 mt-4">
                {Object.keys(grouped).sort().map(catId => {
                  const items = grouped[catId];
                  const predefinedCat = CATEGORIES.find(c => c.id === catId);
                  const icon = predefinedCat ? predefinedCat.icon : "🛠️";
                  const label = predefinedCat ? predefinedCat.label : catId;
                  return (
                    <div key={catId} className="scroll-mt-32">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                            {icon}
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">{label}</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{items.length} providers available</p>
                          </div>
                        </div>
                        {items.length > 4 && (
                          <button 
                            onClick={() => handleCategoryChange(predefinedCat ? predefinedCat.id : catId)}
                            className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                          >
                            View All <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.slice(0, 4).map(p => <ProviderCard key={p.id} provider={p} navigate={navigate} />)}
                      </div>
                    </div>
                  );
                })}
                {allProviders.length === 0 && (
                  <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No providers found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">Try checking back later or adjusting your search filters.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-8 flex items-center justify-between mt-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {searchQuery ? `Results for "${searchQuery}"` : CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{filtered.length} providers found</p>
                  </div>
                </div>

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(p => <ProviderCard key={p.id} provider={p} navigate={navigate} />)}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-6xl mb-6">🏜️</div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No matches found</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-xs mx-auto">
                      We couldn't find any professionals matching your search criteria.
                    </p>
                    <button 
                      onClick={() => { setSearchQuery(""); handleCategoryChange("all"); }}
                      className="btn-outline px-8"
                    >
                      Clear Search & Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showFilter && <FilterPanel filters={filters} setFilters={setFilters} onApply={fetchProviders} onClose={() => setShowFilter(false)} />}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}