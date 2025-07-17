
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CPD_CATEGORIES } from "@/types/profit";

interface CPDSelectorProps {
  selectedCPD: number | null;
  onCPDChange: (cpd: number | null) => void;
}

export const CPDSelector = ({ selectedCPD, onCPDChange }: CPDSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sélectionnez une commission pour commencer :
        </label>
        <Select 
          value={selectedCPD?.toString() || "none"} 
          onValueChange={(value) => onCPDChange(value === "none" ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choisir une tranche CPD" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune sélection</SelectItem>
            {CPD_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category.toString()}>
                CPD {category} DH
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCPD && (
        <Badge variant="default" className="bg-blue-600 text-white">
          Tranche sélectionnée : CPD {selectedCPD} DH
        </Badge>
      )}
      
      {!selectedCPD && (
        <Badge variant="outline" className="text-gray-500">
          Sélectionnez une tranche CPD pour ajouter des produits
        </Badge>
      )}
    </div>
  );
};
