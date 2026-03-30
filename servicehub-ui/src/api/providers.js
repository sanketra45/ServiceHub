// src/api/providers.js
import api from "./axios";
export const searchProviders  = (params) => api.get("/providers/search", { params });
export const getProvider      = (id)     => api.get(`/providers/${id}`);
export const aiRecommend      = (params) => api.get("/providers/ai-recommend", { params });
export const getNearby        = (params) => api.get("/providers/nearby", { params });
export const createProfile    = (data)   => api.post("/providers/profile", data);
export const updateProfile    = (data)   => api.put("/providers/profile", data);
export const getMyProfile     = ()       => api.get("/providers/profile/me");
export const uploadProfilePhoto = (form) => api.post("/images/profile", form);
export const uploadWorkImage  = (form)   => api.post("/images/work", form);
export const getFreeSlots     = (id, date) =>
  api.get(`/availability/${id}/free`, { params: { date } });