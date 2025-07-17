
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
  isArchive: boolean;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  getCurrentMonthRange: () => DateRange;
  getMonthRange: (date: Date) => DateRange;
  isCurrentMonth: () => boolean;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};

interface DateRangeProviderProps {
  children: ReactNode;
}

export const DateRangeProvider: React.FC<DateRangeProviderProps> = ({ children }) => {
  const getCurrentMonthRange = (): DateRange => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
      label: format(now, 'MMMM yyyy'),
      isArchive: false
    };
  };

  const getMonthRange = (date: Date): DateRange => {
    const now = new Date();
    const isCurrentMonth = date.getFullYear() === now.getFullYear() && 
                           date.getMonth() === now.getMonth();
    
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, 'MMMM yyyy'),
      isArchive: !isCurrentMonth
    };
  };

  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange());

  const isCurrentMonth = () => {
    const now = new Date();
    return dateRange.start.getFullYear() === now.getFullYear() && 
           dateRange.start.getMonth() === now.getMonth();
  };

  return (
    <DateRangeContext.Provider
      value={{
        dateRange,
        setDateRange,
        getCurrentMonthRange,
        getMonthRange,
        isCurrentMonth,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};
