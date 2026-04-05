import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// ✅ Attach JWT to requests (except auth endpoints)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // 🔥 Skip token for login & register
  if (!config.url.includes("/auth")) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ✅ Handle unauthorized errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // 🔥 Clear invalid token and redirect
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;