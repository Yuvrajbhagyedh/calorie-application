import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // For now, don't hard-redirect back to /auth on every 401.
      // Many hosted/demo setups may not have a full backend/database,
      // and some non-critical API calls (like loading history) can
      // safely fail without kicking the user out of the app.
      //
      // We still surface the error to callers so they can show a
      // friendly message, but we avoid the jarring redirect loop
      // where the user briefly sees Home and is sent back to Auth.
      //
      // If you later add full backend auth with token expiry, you
      // can re-introduce a redirect here or handle logout in the
      // auth store instead.
    }
    return Promise.reject(error);
  }
);

export default api;

