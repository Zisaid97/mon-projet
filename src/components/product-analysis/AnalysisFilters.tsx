
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { type DateRange } from "react-day-picker";

interface AnalysisFiltersProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductChange: (product: Product | null) => void;
  dateRange: DateRange | undefined;
  onDateChange: (dateRange: DateRange | undefined) => void;
}

export default function AnalysisFilters({
  products,
  selectedProduct,
  onProductChange,
  dateRange,
  onDateChange,
}: AnalysisFiltersProps) {
  const handleProductSelect = (productId: string) => {
    if (productId === "none") {
      onProductChange(null);
    } else {
      const product = products.find(p => p.id === productId);
      onProductChange(product || null);
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🔍 Filtres d'analyse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection du produit */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📦 Produit à analyser
          </label>
          <Select 
            value={selectedProduct?.id || "none"} 
            onValueChange={handleProductSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un produit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun produit sélectionné</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection de la période */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📅 Période d'analyse
          </label>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to 
                    ? `${format(dateRange.from, "dd MMM", { locale: fr })} - ${format(dateRange.to, "dd MMM yyyy", { locale: fr })}`
                    : "Sélectionner une période"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={onDateChange}
                  initialFocus
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                onDateChange({ from: thirtyDaysAgo, to: now });
              }}
            >
              30 derniers jours
            </Button>
          </div>
        </div>

        {/* Informations sur la sélection */}
        {selectedProduct && dateRange?.from && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 animate-fade-in">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-medium">Produit sélectionné : {selectedProduct.name}</div>
              <div className="text-blue-600 dark:text-blue-300">
                Période : du {format(dateRange.from, "dd MMMM yyyy", { locale: fr })} 
                {dateRange.to && ` au ${format(dateRange.to, "dd MMMM yyyy", { locale: fr })}`}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
