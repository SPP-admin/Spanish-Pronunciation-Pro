import axios from "axios";

const DEFAULT_API_BASE = "https://chdr.cs.ucf.edu/pronunciemos";

/** No trailing slash. Set VITE_API_URL on Vercel, e.g. https://your-api.onrender.com/pronunciemos */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DEFAULT_API_BASE;
}

const api = axios.create({
  baseURL: `${getApiBaseUrl()}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
