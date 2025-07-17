
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Filters {
  start: Date | null;
  end: Date | null;
  productIds: string[];
  cities: string[];
  channels: string[];
}

interface FiltersState {
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: Filters = {
  start: null,
  end: null,
  productIds: [],
  cities: [],
  channels: [],
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      hasActiveFilters: () => {
        const { filters } = get();
        return !!(
          filters.start ||
          filters.end ||
          filters.productIds.length > 0 ||
          filters.cities.length > 0 ||
          filters.channels.length > 0
        );
      },
    }),
    {
      name: 'dashboard-filters',
    }
  )
);
