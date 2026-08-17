import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: null,
  setTheme: (theme) => set({ theme })
}));

export default useThemeStore;
