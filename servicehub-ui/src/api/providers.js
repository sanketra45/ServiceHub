// src/api/providers.js
import api from "./axios";

export const searchProviders  = (params) => api.get("/providers/search", { params });
export const getProvider      = (id)     => api.get(`/providers/${id}`);
export const aiRecommend      = (params) => api.get("/providers/ai-recommend", { params });
export const getNearby        = (params) => api.get("/providers/nearby", { params });

export const createProfile    = (data)   => api.post("/providers/profile", data);
export const updateProfile    = (data)   => api.put("/providers/profile", data);
export const getMyProfile     = ()       => api.get("/providers/profile/me");

// ✅ FIXED
export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");

  return api.post("/images/profile", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ FIXED
export const uploadWorkImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");

  return api.post("/images/work", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getFreeSlots = (id, date) =>
  api.get(`/availability/${id}/free`, { params: { date } });

// Availability Endpoints
export const getProviderAvailability = (providerId) => api.get(`/availability/${providerId}`);
export const addProviderSlot = (data) => api.post("/availability", data);
export const deleteProviderSlot = (slotId) => api.delete(`/availability/${slotId}`);