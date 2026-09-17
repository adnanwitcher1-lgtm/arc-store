import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
export const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const ACCESS_KEY = "arc_access_token";
const REFRESH_KEY = "arc_refresh_token";
const GUEST_KEY = "arc_guest_token";

export function getGuestToken() {
  let token = localStorage.getItem(GUEST_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, token);
  }
  return token;
}

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  } else {
    config.headers["X-Guest-Token"] = getGuestToken();
  }
  return config;
});

let isRefreshing = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refresh = tokenStore.getRefresh();

    if (error.response?.status === 401 && refresh && !original._retried) {
      original._retried = true;
      try {
        isRefreshing =
          isRefreshing ||
          axios.post(`${API_BASE_URL}/auth/login/refresh/`, { refresh });
        const { data } = await isRefreshing;
        isRefreshing = null;
        tokenStore.set(data.access, refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch {
        isRefreshing = null;
        tokenStore.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default client;
