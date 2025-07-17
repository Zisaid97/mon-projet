
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMonthStore } from '@/stores/monthStore';

export function useMonthInitializer() {
  const location = useLocation();
  const { setMonth } = useMonthStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const monthFromUrl = searchParams.get('month');
    
    if (monthFromUrl && /^\d{4}-\d{2}$/.test(monthFromUrl)) {
      setMonth(monthFromUrl);
    }
  }, [location.search, setMonth]);
}
