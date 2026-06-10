import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach token if present
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("orbit_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const fileUrl = (path) => (path ? `${API}/files/${path}` : "");

export default api;
