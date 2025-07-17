
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

interface EditableMarginCellProps {
  value: number;
  onSave: (newValue: number) => void;
  isUpdating?: boolean;
  exchangeRate?: number;
}

export function EditableMarginCell({ value, onSave, isUpdating = false, exchangeRate = 10 }: EditableMarginCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // SOLUTION FINALE : Stocker la marge directement en DH (valeur absolue)
  // La valeur reçue est déjà la marge en DH, pas besoin de conversion
  const displayValueDH = Math.round(value);
  const [editValue, setEditValue] = useState(displayValueDH.toString());

  const handleSave = () => {
    const numValueDH = parseInt(editValue);
    if (!isNaN(numValueDH) && numValueDH >= 0) {
      // Sauvegarder directement la valeur DH sans conversion
      console.log("[Debug] 💰 Sauvegarde marge DH directe:", { numValueDH });
      onSave(numValueDH);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(displayValueDH.toString());
    setIsEditing(false);
  };

  const handleEdit = () => {
    // Utiliser la valeur DH directe
    setEditValue(displayValueDH.toString());
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step="1"
          min="0"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-20 h-8 text-xs"
          autoFocus
          disabled={isUpdating}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0" disabled={isUpdating}>
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded group"
      onClick={handleEdit}
    >
      <div className="text-center">
        <div className="font-medium text-orange-600">
          {displayValueDH} DH
        </div>
      </div>
      <Edit className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
