
import { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableCpdCellProps {
  value: number;
  onSave: (newValue: number) => void;
  isUpdating?: boolean;
  className?: string;
}

export function EditableCpdCell({ 
  value, 
  onSave, 
  isUpdating = false,
  className = "" 
}: EditableCpdCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const startEdit = () => {
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const saveEdit = () => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue <= 0) {
      return;
    }
    onSave(newValue);
    setIsEditing(false);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-24"
          min="0"
          step="0.01"
          autoFocus
        />
        <Button
          size="sm"
          variant="outline"
          onClick={saveEdit}
          disabled={isUpdating}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={cancelEdit}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>{value.toFixed(2)} DH</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={startEdit}
        className="text-gray-600 hover:text-gray-900 p-1"
      >
        <Edit3 className="w-3 h-3" />
      </Button>
    </div>
  );
}
