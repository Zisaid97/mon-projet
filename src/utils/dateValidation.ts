
import { format } from "date-fns";

export function checkDateValidation(date: Date | undefined, monthData: any[]) {
  if (!date) return { selectedDateIsFuture: false, hasDataForSelectedDate: false };
  
  const selectedDateIsFuture = date > new Date();
  const hasDataForSelectedDate = monthData.some((d) => d.date === format(date, "yyyy-MM-dd"));
  
  return { selectedDateIsFuture, hasDataForSelectedDate };
}

export function createDatesWithDataSet(monthData: any[]): Set<string> {
  return new Set(monthData.map(item => item.date));
}
