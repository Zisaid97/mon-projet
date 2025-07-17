
// Factorisé: utilise le nouveau hook et composant pour l'affichage.
import { useActivityHistory } from "@/hooks/useActivityHistory";
import ActivityLogTable from "../activity/ActivityLogTable";

export default function OrganizationActivityLog() {
  const { activityLog, isLoading } = useActivityHistory();
  return <ActivityLogTable activityLog={activityLog} isLoading={isLoading} />;
}
