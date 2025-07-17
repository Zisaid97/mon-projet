
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DeleteDataButtonProps {
  date: Date | undefined;
  onDelete: () => void;
  hasData: boolean;
}

export function DeleteDataButton({ date, onDelete, hasData }: DeleteDataButtonProps) {
  if (!date || !hasData) {
    return null;
  }

  const formattedDate = format(date, "dd MMMM yyyy", { locale: fr });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>🗑️ Supprimer les données</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Êtes-vous sûr de vouloir supprimer les données marketing du <strong>{formattedDate}</strong> ?</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
              <p className="font-medium text-yellow-800">⚠️ Action de synchronisation :</p>
              <p className="text-yellow-700 mt-1">
                Cette suppression va également supprimer automatiquement toutes les attributions correspondantes 
                dans le module "Attribution des Dépenses" pour maintenir la cohérence des données.
              </p>
            </div>
            <p className="text-red-600 font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
            🗑️ Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
