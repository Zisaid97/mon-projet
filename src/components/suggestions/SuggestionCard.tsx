
import { Suggestion } from "@/pages/SuggestionsIA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onStatusChange: (status: "suivie" | "ignorée") => void;
}

export function SuggestionCard({ suggestion, onStatusChange }: SuggestionCardProps) {
  let icon = <Zap className="h-5 w-5 text-yellow-500" />;
  if (suggestion.type === "marketing") icon = <TrendingUp className="h-5 w-5 text-green-600" />;
  if (suggestion.type === "finances") icon = <TrendingDown className="h-5 w-5 text-rose-600" />;
  if (suggestion.type === "produits") icon = <Zap className="h-5 w-5 text-purple-600" />;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="font-semibold text-lg">{suggestion.title}</h3>
        <Badge>{suggestion.status === "nouvelle" ? "Nouvelle" : suggestion.status === "suivie" ? "Suivie" : "Ignorée"}</Badge>
      </div>
      <div className="text-gray-700 dark:text-gray-300 mb-4">{suggestion.description}</div>
      <div className="flex gap-3 mt-auto">
        <Button size="sm" variant="outline" onClick={() => onStatusChange("ignorée")} disabled={suggestion.status === "ignorée"}>
          Ignorer
        </Button>
        <Button size="sm" onClick={() => onStatusChange("suivie")} disabled={suggestion.status === "suivie"}>
          Suivre la suggestion
        </Button>
      </div>
    </div>
  );
}
