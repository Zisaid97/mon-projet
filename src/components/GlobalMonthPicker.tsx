
import { useState } from 'react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useMonthStore } from '@/stores/monthStore';
import { useToast } from '@/hooks/use-toast';

export function GlobalMonthPicker() {
  const { current, setMonth, setLoading, archiveMode, setArchiveMode } = useMonthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Parse current month string to Date object
  const currentDate = parse(current + '-01', 'yyyy-MM-dd', new Date());

  const handleMonthSelect = async (date: Date | undefined) => {
    if (!date) return;

    const monthString = format(date, 'yyyy-MM');
    
    // Show loading state
    setLoading(true);
    
    try {
      // Update store
      setMonth(monthString);
      
      // Update URL with shallow routing
      const currentPath = window.location.pathname;
      const url = new URL(window.location.href);
      url.searchParams.set('month', monthString);
      window.history.replaceState({}, '', url.toString());
      
      // Close popover
      setIsOpen(false);
      
      // Show success toast
      toast({
        title: "Mois sélectionné",
        description: `Données de ${format(date, 'MMMM yyyy', { locale: fr })} chargées`,
      });
      
    } catch (error) {
      console.error('Erreur lors du changement de mois:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le mois sélectionné",
        variant: "destructive",
      });
    } finally {
      // Remove loading state after a short delay to allow data fetching
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Archive Mode Toggle */}
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-muted-foreground" />
        <Switch
          checked={archiveMode}
          onCheckedChange={(checked) => {
            setArchiveMode(checked);
            toast({
              title: checked ? "Mode archive activé" : "Mode archive désactivé",
              description: checked 
                ? "Affichage des données archivées" 
                : "Affichage des données courantes",
            });
          }}
        />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal bg-white dark:bg-slate-800",
              !current && "text-muted-foreground",
              archiveMode && "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {current ? (
              <span>
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
                {archiveMode && " (Archive)"}
              </span>
            ) : (
              <span>Sélectionner un mois</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleMonthSelect}
            disabled={(date) => !archiveMode && date > new Date()}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
