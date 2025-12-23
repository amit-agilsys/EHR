import axios from "axios";
import { store } from "../stores/store";
import { setToken } from "slices/auth.slice";
// import { toast } from "react-toastify";

const getJWTToken = () => {
  const state = store.getState();
  return state.auth.JWT_token;
};

const baseURL = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const pathname = window.location.pathname.split("/")[1];
    if (pathname) {
      config.headers["Current-Path"] = pathname;
    }
    const JWT_token = getJWTToken();
    if (JWT_token) {
      config.headers.Authorization = `Bearer ${JWT_token}`;
    } else {
      console.warn("No token found");
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers.authorization;
    if (newToken && newToken.startsWith("Bearer ")) {
      const token = newToken.split(" ")[1];

      if (token !== getJWTToken()) {
        store.dispatch(setToken(token));
      }
    }
    return response;
  },
  async (error) => {
    const res = error.response;

    if (res?.data instanceof Blob && res.data.type === "application/json") {
      const text = await res.data.text();
      try {
        res.data = JSON.parse(text);
      } catch {
        console.warn("Failed to parse JSON from Blob error");
      }
    }

    if (res?.status === 401) {
      // store.dispatch(logout());
    }

    console.error("Response Error:", error);

    return Promise.reject(error);
  }
);

export default api;
