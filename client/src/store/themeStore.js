import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
  // Check localStorage or system preference
  darkMode: (() => {
    const stored = localStorage.getItem('jurisbridge_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })(),

  toggleTheme: () => {
    const newMode = !get().darkMode;
    localStorage.setItem('jurisbridge_theme', newMode ? 'dark' : 'light');
    set({ darkMode: newMode });
  },

  setDarkMode: (value) => {
    localStorage.setItem('jurisbridge_theme', value ? 'dark' : 'light');
    set({ darkMode: value });
  },
}));

export default useThemeStore;