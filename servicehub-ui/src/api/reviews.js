import api from "./axios";
export const submitReview     = (data) => api.post("/reviews", data);
export const getProviderReviews = (id) => api.get(`/reviews/provider/${id}`);
export const getMyReviews     = ()     => api.get("/reviews/my");