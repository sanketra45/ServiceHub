import api from "./axios";

export const getCurrentUser = () => api.get("/users/me");
export const updateProfile = (data) => api.put("/users/me", data);
