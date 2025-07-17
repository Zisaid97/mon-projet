import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { SuggestionCard } from "@/components/suggestions/SuggestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Zap, TrendingUp, TrendingDown } from "lucide-react";

type SuggestionType = "marketing" | "finances" | "produits" | "logistique";

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  status: "nouvelle" | "suivie" | "ignorée";
}

const dummySuggestions: Suggestion[] = [
  {
    id: "1",
    type: "marketing",
    title: "🚀 Scaler la campagne Facebook \"Lead DH Juin\"",
    description: "Les performances récentes indiquent un CPL inférieur à la moyenne et un taux de livraison élevé (>85%).",
    status: "nouvelle",
  },
  {
    id: "2",
    type: "finances",
    title: "💰 Réduire le budget campagne Google Ads",
    description: "Dépenses élevées détectées pour un ROI en baisse sur la semaine écoulée.",
    status: "nouvelle",
  },
  {
    id: "3",
    type: "produits",
    title: "🏆 Mettre en avant le produit 'ActiveFit Deck'",
    description: "Ce produit a généré le profit net le plus élevé du mois dernier.",
    status: "nouvelle",
  },
  {
    id: "4",
    type: "marketing",
    title: "⏸️ Mettre en pause la campagne 'Tests TikTok'",
    description: "Aucune livraison détectée depuis 3 jours, CPD > 20 $.",
    status: "nouvelle",
  },
];

const typeLabels: Record<SuggestionType, string> = {
  marketing: "Marketing",
  finances: "Finances",
  produits: "Produits",
  logistique: "Logistique",
};

export default function SuggestionsIA() {
  const [filter, setFilter] = useState<SuggestionType | "all">("all");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(dummySuggestions);

  const filtered = filter === "all"
    ? suggestions
    : suggestions.filter((s) => s.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-indigo-200">
                Suggestions IA
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                Recevez des recommandations personnalisées pour optimiser vos campagnes, finances et produits.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-3 text-gray-800 dark:text-gray-200">
            Filtrer par type :
          </span>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Toutes</Button>
          {Object.entries(typeLabels).map(([type, label]) => (
            <Button 
              key={type}
              size="sm"
              variant={filter === type ? "default" : "outline"}
              onClick={() => setFilter(type as SuggestionType)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-600 dark:text-gray-400">Aucune suggestion pour ce filtre.</div>
          )}
          {filtered.map((sugg) => (
            <SuggestionCard 
              key={sugg.id}
              suggestion={sugg}
              onStatusChange={(status) => {
                setSuggestions((old) =>
                  old.map((item) =>
                    item.id === sugg.id ? { ...item, status } : item
                  )
                );
              }}
            />
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-bold text-xl mb-3">Historique des suggestions</h2>
          <div className="space-y-3">
            {/* Pour l'instant, on affiche les suggestions non "nouvelles" ici */}
            {suggestions.filter(s => s.status !== "nouvelle").length === 0 && (
              <div className="text-gray-500 text-sm">Pas encore d'historique…</div>
            )}
            {suggestions.filter(s => s.status !== "nouvelle").map((sugg) => (
              <div key={sugg.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-4 py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{sugg.title}</div>
                  <div className="text-xs text-gray-600">{typeLabels[sugg.type]}</div>
                </div>
                <Badge variant={sugg.status === "suivie" ? "default" : "outline"}>
                  {sugg.status === "suivie" ? "Suivie" : "Ignorée"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
