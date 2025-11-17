import axios from 'axios';

// ✅ In Vite, env vars must start with "VITE_"
const BASE =
 const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
