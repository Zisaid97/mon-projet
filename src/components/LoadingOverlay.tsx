
import { useMonthStore } from '@/stores/monthStore';
import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
  const { isLoading } = useMonthStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Chargement des données...
        </span>
      </div>
    </div>
  );
}
