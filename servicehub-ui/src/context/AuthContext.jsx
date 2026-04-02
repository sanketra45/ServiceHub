import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, register as registerApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (token && stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

const login = async (credentials) => {
  console.log("🔥 AuthContext login called");

  const res = await loginApi(credentials);

  console.log("🔥 API RESPONSE:", res);

  const data = res.data; // ✅ back to res.data (NOT res.data.data)

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));

  setUser(data);

  return data;
};

const register = async (formData) => {
  const { data } = await registerApi(formData);

  localStorage.setItem("token", data.token); // ✅ back to data.token
  localStorage.setItem("user", JSON.stringify(data));

  setUser(data);
  return data;
};

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  const isRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);