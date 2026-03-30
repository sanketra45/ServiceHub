// src/components/ProviderCard.jsx
import { useNavigate } from "react-router-dom";
import { Star, MapPin, BadgeCheck } from "lucide-react";

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/provider/${provider.id}`)}
      className="card flex flex-col cursor-pointer group h-full">
      {/* Photo */}
      <div className="h-56 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {provider.photoUrl ? (
          <img
            src={`http://localhost:8080${provider.photoUrl}`}
            alt={provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-5xl font-bold text-primary-200 group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-primary-50 to-primary-100">
            {provider.name?.[0]}
          </div>
        )}
        
        {/* Verification Badge */}
        {provider.verified && (
          <span className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/90
                           backdrop-blur-md px-2.5 py-1.5 rounded-lg
                           flex items-center gap-1.5 text-xs font-semibold
                           text-emerald-600 dark:text-emerald-400 shadow-soft">
            <BadgeCheck size={14} className="text-emerald-500" />
            Verified
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{provider.name}</h3>
          
          <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md text-sm">
            <Star size={14} fill="currentColor" />
            {provider.averageRating?.toFixed(1) || "New"}
          </span>
        </div>
        
        <p className="text-primary-600 font-semibold text-sm mb-4">
          {provider.serviceType}
        </p>

        <div className="flex items-center text-sm mb-6 text-slate-500 dark:text-slate-400 mt-auto">
          <span className="flex items-center gap-1.5">
            <MapPin size={16} className="text-slate-400 dark:text-slate-500" />
            {provider.city}
          </span>
          <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
          <span>{provider.totalReviews} reviews</span>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{provider.hourlyRate}
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/hr</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 rounded-xl
                       text-sm font-semibold hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 transition-colors duration-300">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}