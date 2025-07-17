
import { useExchangeRateSync } from "./useExchangeRateSync";

export function useExchangeRate(selectedDate?: Date) {
  const { exchangeRate } = useExchangeRateSync(selectedDate);
  
  return {
    data: exchangeRate,
    isLoading: false, // Pour maintenir la compatibilité avec l'ancien API
  };
}
