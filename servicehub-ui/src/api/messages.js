import api from "./axios";

export const getMyMessages = () => api.get("/messages");
export const markMessageAsRead = (id) => api.patch(`/messages/${id}/read`);
