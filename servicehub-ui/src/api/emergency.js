import api from "./axios";
export const createEmergency  = (params) =>
  api.post("/emergency", null, { params });
export const getMyEmergencies = ()       => api.get("/emergency/my");