import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT_ITEMS = 8;

const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addViewedItem: (product) => {
        set((state) => {
          // Remove if it already exists so we can bump it to the top
          const filtered = state.items.filter(item => item.id !== product.id);
          const newItems = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
          return { items: newItems };
        });
      },

      clearViewedItems: () => set({ items: [] }),
    }),
    {
      name: 'aurelia-recently-viewed-storage',
    }
  )
);

export default useRecentlyViewedStore;
