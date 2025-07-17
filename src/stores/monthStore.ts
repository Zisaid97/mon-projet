
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MonthState {
  current: string; // Format: 'YYYY-MM'
  setMonth: (month: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  archiveMode: boolean;
  setArchiveMode: (enabled: boolean) => void;
}

export const useMonthStore = create<MonthState>()(
  persist(
    (set) => ({
      current: new Date().toISOString().slice(0, 7), // Default to current month
      setMonth: (month: string) => set({ current: month }),
      isLoading: false,
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      archiveMode: false,
      setArchiveMode: (enabled: boolean) => set({ archiveMode: enabled }),
    }),
    {
      name: 'month-storage',
      partialize: (state) => ({ current: state.current, archiveMode: state.archiveMode }),
    }
  )
);
