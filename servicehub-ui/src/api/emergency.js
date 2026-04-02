import api from "./axios";

export const getMyEmergencies = () =>
  api.get("/emergency/my");

export const createEmergency = (data) =>
  api.post("/emergency", data);