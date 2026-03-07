import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('jurisbridge_user')) || null,
  lawyer: JSON.parse(localStorage.getItem('jurisbridge_lawyer')) || null,
  token: localStorage.getItem('jurisbridge_token') || null,
  isLoading: false,

  // Register user
  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('jurisbridge_token', data.token);
      localStorage.setItem('jurisbridge_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      toast.success(data.message || 'Welcome to JurisBridge! 🔨');
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  // Register lawyer
  registerLawyer: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register/lawyer', formData);
      localStorage.setItem('jurisbridge_token', data.token);
      localStorage.setItem('jurisbridge_user', JSON.stringify(data.user));
      localStorage.setItem('jurisbridge_lawyer', JSON.stringify(data.lawyer));
      set({ user: data.user, lawyer: data.lawyer, token: data.token, isLoading: false });
      toast.success(data.message || 'Lawyer account created! ⚖️');
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  // Login
  login: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('jurisbridge_token', data.token);
      localStorage.setItem('jurisbridge_user', JSON.stringify(data.user));
      if (data.lawyer) {
        localStorage.setItem('jurisbridge_lawyer', JSON.stringify(data.lawyer));
      }
      set({
        user: data.user,
        lawyer: data.lawyer || null,
        token: data.token,
        isLoading: false,
      });
      toast.success(data.message || `Welcome back! 🔨`);
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('jurisbridge_token');
    localStorage.removeItem('jurisbridge_user');
    localStorage.removeItem('jurisbridge_lawyer');
    set({ user: null, lawyer: null, token: null });
    toast.success('Logged out successfully');
  },

  // Update profile
  updateProfile: async (formData) => {
    try {
      const { data } = await api.put('/auth/profile', formData);
      localStorage.setItem('jurisbridge_user', JSON.stringify(data.user));
      set({ user: data.user });
      toast.success('Profile updated! ✅');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      throw error;
    }
  },

  // Check if authenticated
  isAuthenticated: () => !!get().token,

  // Check role
  isLawyer: () => get().user?.role === 'lawyer',
  isUser: () => get().user?.role === 'user',
}));

export default useAuthStore;