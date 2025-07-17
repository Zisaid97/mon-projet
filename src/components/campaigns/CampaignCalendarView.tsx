import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths, eachDayOfInterval, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BadgeCheck, BadgeAlert, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CampaignFormDialog, CampaignFormData } from "./CampaignFormDialog";

type Campaign = {
  id: string;
  name: string;
  platform: string;
  planned_budget: number;
  planned_budget_currency: string;
  status: string;
  estimated_leads: number | null;
  estimated_deliveries: number | null;
  date: string;
};

const statusIcon = {
  "terminée": <BadgeCheck className="text-green-500 w-5 h-5" />,
  "en cours": <BadgeAlert className="text-yellow-500 w-5 h-5" />,
  "planifiée": <XCircle className="text-gray-400 w-5 h-5" />,
};

export function CampaignCalendarView() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editCampaign, setEditCampaign] = useState<CampaignFormData | null>(null);

  // Récupérer toutes les campagnes du mois en cours
  const { data: campaigns = [], refetch, isLoading } = useQuery({
    queryKey: ["campaigns", user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return [];
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as CampaignFormData[];
    },
    enabled: !!user,
  });

  // TODO: Fetch produits user pour la liaison produit - ici simplifié/mocked
  const { data: products = [] } = useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    enabled: !!user,
  });

  // Génère la liste des jours du mois courant
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Grouper les campagnes par date
  const campaignsByDay = campaigns.reduce((acc, campaign) => {
    const day = format(new Date(campaign.date), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(campaign);
    return acc;
  }, {} as Record<string, CampaignFormData[]>);

  // Ouvre formulaire d'ajout pour un jour
  const handleAddCampaign = (date: string) => {
    setEditCampaign(null);
    setSelectedDate(date);
    setFormOpen(true);
  };

  // Ouvre formulaire d'édition pour une campagne
  const handleEditCampaign = (campaign: CampaignFormData) => {
    setEditCampaign(campaign);
    setSelectedDate(campaign.date);
    setFormOpen(true);
  };

  // Rafraîchit après ajout/édition campagne
  const handleSuccess = () => {
    refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          Mois précédent
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          Mois suivant
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 bg-slate-50 rounded-lg p-4 dark:bg-slate-800">
        {monthDays.map((date) => {
          const dayKey = format(date, "yyyy-MM-dd");
          const campaignsForDay = campaignsByDay[dayKey] || [];
          return (
            <div
              key={dayKey}
              className={`border rounded-md min-h-[100px] p-1 flex flex-col ${isSameMonth(date, currentMonth) ? "" : "opacity-30"}`}
            >
              <div className="text-xs font-semibold text-gray-600 mb-1">{format(date, "d")}</div>
              {campaignsForDay.length === 0 && (
                <Button size="sm" variant="ghost" className="mt-auto" disabled={isLoading} onClick={() => handleAddCampaign(dayKey)}>
                  + Ajouter
                </Button>
              )}
              {campaignsForDay.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white dark:bg-gray-900 rounded shadow px-1 py-0.5 mb-1 cursor-pointer flex items-center gap-1"
                  title={camp.name}
                  onClick={() => handleEditCampaign(camp)}
                >
                  <span className="text-xs font-bold line-clamp-1">{camp.name}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px]">
                    {camp.status && statusIcon[camp.status] ? statusIcon[camp.status] : null}
                  </span>
                  <span className="text-[11px] text-blue-500">
                    {camp.planned_budget}
                    {camp.planned_budget_currency}
                  </span>
                </div>
              ))}
              {campaignsForDay.length > 0 && (
                <Button size="sm" variant="ghost" className="mt-auto" onClick={() => handleAddCampaign(dayKey)}>
                  + Ajouter
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <CampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        date={selectedDate || format(new Date(), "yyyy-MM-dd")}
        initialValues={editCampaign}
        onSuccess={handleSuccess}
        products={products}
      />
    </div>
  );
}
