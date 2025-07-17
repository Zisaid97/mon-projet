
import { Badge } from "../ui/badge";
import { Loader2 } from "lucide-react";

/**
 * Table d'affichage de l'historique d'activité
 * props:
 *  - activityLog: array des logs à afficher
 *  - isLoading: bool
 */
export default function ActivityLogTable({ activityLog, isLoading }: { activityLog: any[]; isLoading: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-lg font-bold mb-4">Historique d’activité</h2>
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin w-4 h-4" /> Chargement...
        </div>
      ) : !activityLog.length ? (
        <div className="text-gray-500 text-sm">Aucune activité récente.</div>
      ) : (
        <ul className="divide-y">
          {activityLog.map((item) => (
            <li key={item.id} className="py-2 text-sm flex items-center gap-2">
              <Badge variant="outline" className="capitalize">{item.action}</Badge>
              <span>
                <b>{item.entity_type}</b>
                {item.entity_id ? <> (<span className="text-xs">{item.entity_id}</span>)</> : null}
              </span>
              <span className="ml-2 text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
