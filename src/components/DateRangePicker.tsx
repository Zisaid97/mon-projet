
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Archive, CalendarRange, CalendarDays } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DateRangePicker() {
  const { dateRange, setDateRange, getMonthRange, getCurrentMonthRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSingleDate, setSelectedSingleDate] = useState<Date>();
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);

  // Générer les 12 derniers mois
  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    
    // Mois current
    months.push({
      date: now,
      label: format(now, "MMMM yyyy", { locale: fr }),
      isArchive: false
    });
    
    // 11 mois précédents
    for (let i = 1; i <= 11; i++) {
      const date = subMonths(now, i);
      months.push({
        date,
        label: format(date, "MMMM yyyy", { locale: fr }),
        isArchive: true
      });
    }
    
    return months;
  };

  const availableMonths = getAvailableMonths();

  const handleMonthSelect = (monthData: { date: Date; isArchive: boolean }) => {
    const range = getMonthRange(monthData.date);
    setDateRange(range);
    setIsOpen(false);
  };

  const handleCurrentMonth = () => {
    setDateRange(getCurrentMonthRange());
    setIsOpen(false);
  };

  const handleSingleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedSingleDate(date);
    setDateRange({
      start: startOfDay(date),
      end: endOfDay(date),
      label: format(date, "dd MMM yyyy", { locale: fr }),
      isArchive: false
    });
    setIsOpen(false);
  };

  const handleRangeDateSelect = (dates: { from?: Date; to?: Date } | undefined) => {
    if (!dates) return;
    
    if (dates.from && dates.to) {
      setSelectedDateRange({ from: dates.from, to: dates.to });
      setDateRange({
        start: startOfDay(dates.from),
        end: endOfDay(dates.to),
        label: `${format(dates.from, "dd MMM", { locale: fr })} - ${format(dates.to, "dd MMM yyyy", { locale: fr })}`,
        isArchive: false
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal min-w-[200px]",
              dateRange.isArchive && "border-orange-300 bg-orange-50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.label}
            {dateRange.isArchive && (
              <Archive className="ml-2 h-3 w-3 text-orange-600" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Tabs defaultValue="months" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="months" className="text-xs">
                📅 Mois
              </TabsTrigger>
              <TabsTrigger value="single" className="text-xs">
                <CalendarDays className="h-3 w-3 mr-1" />
                Date
              </TabsTrigger>
              <TabsTrigger value="range" className="text-xs">
                <CalendarRange className="h-3 w-3 mr-1" />
                Plage
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="months" className="p-3 mt-0">
              <div className="mb-3">
                <Button
                  variant={!dateRange.isArchive ? "default" : "outline"}
                  size="sm"
                  onClick={handleCurrentMonth}
                  className="w-full justify-start"
                >
                  📅 Mois actuel - {format(new Date(), "MMMM yyyy", { locale: fr })}
                </Button>
              </div>
              
              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Archives
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableMonths.slice(1).map((month, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMonthSelect(month)}
                      className={cn(
                        "w-full justify-start text-sm",
                        dateRange.isArchive && 
                        dateRange.label === month.label && 
                        "bg-orange-100 text-orange-800"
                      )}
                    >
                      {month.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="single" className="p-0">
              <Calendar
                mode="single"
                selected={selectedSingleDate}
                onSelect={handleSingleDateSelect}
                locale={fr}
                className="p-3 pointer-events-auto"
              />
            </TabsContent>

            <TabsContent value="range" className="p-0">
              <Calendar
                mode="range"
                selected={selectedDateRange}
                onSelect={handleRangeDateSelect}
                locale={fr}
                className="p-3 pointer-events-auto"
                numberOfMonths={2}
              />
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      
      {dateRange.isArchive && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          Archive
        </Badge>
      )}
    </div>
  );
}
