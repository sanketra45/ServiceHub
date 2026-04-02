import api from "./axios";

// 🔥 CREATE BOOKING
export const createBooking = (data) =>
  api.post("/bookings", data); // ✅ fixed

// 🔥 CUSTOMER BOOKINGS
export const getMyBookings = () =>
  api.get("/bookings/my"); // ✅ ok

// 🔥 PROVIDER BOOKINGS
export const getProviderBookings = () =>
  api.get("/bookings/provider"); // ✅ ok

// 🔥 UPDATE STATUS
export const updateStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, null, { params: { status } });