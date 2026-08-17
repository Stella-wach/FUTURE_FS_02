import axios from 'axios';

// In production, point at the deployed Render backend (set via Vercel's
// VITE_API_URL env var). Locally, fall back to the relative /api path,
// which Vite's dev server proxies to localhost:5000 (see vite.config.js).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
