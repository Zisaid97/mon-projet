
import { useState, useEffect } from "react";
import { useFinancialRowForDate, useUpsertFinancialRow, useDeleteFinancialRow } from "@/hooks/useFinancialTracking";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Props = {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
};

export default function FinancialForm({ selectedDate, setSelectedDate }: Props) {
  const { user } = useAuth();
  const { data: oldRow } = useFinancialRowForDate(selectedDate);
  const [date, setDate] = useState(selectedDate);
  const [exchangeRate, setExchangeRate] = useState<number>(10);
  const [amountUsd, setAmountUsd] = useState<number>(0);
  const upsert = useUpsertFinancialRow();
  const deleteRow = useDeleteFinancialRow();

  useEffect(() => {
    setDate(selectedDate);
    if (oldRow) {
      setExchangeRate(oldRow.exchange_rate);
      setAmountUsd(oldRow.amount_received_usd);
    } else {
      setExchangeRate(10);
      setAmountUsd(0);
    }
  }, [selectedDate, oldRow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await upsert.mutateAsync({
        user_id: user.id,
        date,
        exchange_rate: exchangeRate,
        amount_received_usd: amountUsd,
      });
      toast({ title: "Enregistré", description: "Ligne sauvegardée !" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteRow.mutateAsync({ user_id: user.id, date });
      toast({ title: "Supprimé", description: "Ligne supprimée." });
      setAmountUsd(0);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  // Conversion dynamique
  const amountMad = (amountUsd * exchangeRate).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2 mb-2">💰 Saisie journalière</h2>
        <div className="text-sm text-gray-500 mb-2">Enregistrez le montant reçu chaque jour (1 entrée par date).</div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-blue-400" />
                Date de réception
              </span>
              <input
                type="date"
                value={date}
                onChange={e => setSelectedDate(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
            <label className="block text-sm font-medium mb-1">
              Taux de change
              <input
                type="number"
                step="0.0001"
                min={0.1}
                value={exchangeRate}
                onChange={e => setExchangeRate(parseFloat(e.target.value))}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex. 10.24"
                required
              />
            </label>
            <label className="block text-sm font-medium mb-1">
              Montant reçu ($)
              <input
                type="number"
                step="0.01"
                min={0}
                value={amountUsd}
                onChange={e => setAmountUsd(parseFloat(e.target.value))}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex. 235.00"
                required
              />
            </label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Conversion automatique :</span>
              <Badge className="bg-gray-100 text-gray-700 text-sm px-2 py-0.5 font-mono">
                {amountMad} MAD
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={upsert.isPending}>
            {oldRow ? "Modifier" : "Ajouter"}
          </Button>
          {oldRow && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteRow.isPending}>
              Supprimer
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
