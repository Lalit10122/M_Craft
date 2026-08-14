import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (user) => set({ user })
    }),
    {
      name: 'customer-auth',
      onRehydrateStorage: () => (state) => {
        // Called when localStorage has been read and state is restored
        if (state) state.setHasHydrated(true);
      }
    }
  )
);

export default useAuthStore;
