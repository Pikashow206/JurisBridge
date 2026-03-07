import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jurisbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Handle token expiry
    if (error.response?.status === 401) {
      localStorage.removeItem('jurisbridge_token');
      localStorage.removeItem('jurisbridge_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    }

    return Promise.reject(error);
  }
);

export default api;