
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  value: number;
  onSave: (newValue: number) => void;
  isUpdating?: boolean;
  className?: string;
}

export function EditableCell({ value, onSave, isUpdating = false, className = "" }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleSave = () => {
    const numValue = parseInt(editValue) || 0;
    if (numValue !== value) {
      onSave(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-8 w-16 text-center"
        autoFocus
        type="number"
        min="0"
        disabled={isUpdating}
      />
    );
  }

  return (
    <span
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
      title="Cliquer pour modifier"
    >
      {value}
    </span>
  );
}
