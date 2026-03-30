import api from "./axios";
export const getStats           = ()     => api.get("/admin/stats");
export const getAllUsers         = ()     => api.get("/admin/users");
export const toggleUser         = (id)   => api.patch(`/admin/users/${id}/toggle`);
export const deleteUser         = (id)   => api.delete(`/admin/users/${id}`);
export const getPendingProviders= ()     => api.get("/admin/providers/pending");
export const verifyProvider     = (id)   => api.patch(`/admin/providers/${id}/verify`);
export const getAllBookings      = ()     => api.get("/admin/bookings");
export const deleteReview       = (id)   => api.delete(`/admin/reviews/${id}`);