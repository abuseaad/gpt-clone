// One shared axios instance for all API calls.
// It adds the login token to every request automatically.
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3888";

const TOKEN_KEY = "token";

// --- Token helpers (the token is kept in the browser's localStorage) ---
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode): the user just has to log in again
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

const client = axios.create({ baseURL: API_BASE_URL });

// Before every request: attach "Authorization: Bearer <token>" if we have one
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthProvider registers a function here that logs the user out locally
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// After every response: if the server says 401 for a protected request,
// the token is invalid or expired, so log the user out.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthForm = url.includes("/api/auth/login") || url.includes("/api/auth/register");
    if (error.response?.status === 401 && !isAuthForm && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

// Turn any axios error into a message we can show to the user
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return "Cannot reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
};

export default client;
