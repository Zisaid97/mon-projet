
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CountryFilters {
  selectedCountries: string[];
  selectedKpi: 'roi' | 'revenue' | 'deliveries';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface CountryFiltersState {
  filters: CountryFilters;
  setFilters: (filters: Partial<CountryFilters>) => void;
  resetFilters: () => void;
  setSelectedCountries: (countries: string[]) => void;
  setSelectedKpi: (kpi: 'roi' | 'revenue' | 'deliveries') => void;
}

const defaultFilters: CountryFilters = {
  selectedCountries: ['MA'],
  selectedKpi: 'roi',
  dateRange: {
    start: null,
    end: null,
  },
};

export const useCountryFiltersStore = create<CountryFiltersState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      setSelectedCountries: (countries) =>
        set((state) => ({
          filters: { ...state.filters, selectedCountries: countries },
        })),
      setSelectedKpi: (kpi) =>
        set((state) => ({
          filters: { ...state.filters, selectedKpi: kpi },
        })),
    }),
    {
      name: 'country-dashboard-filters',
    }
  )
);
