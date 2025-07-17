
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddNewCardProps {
  onClick: () => void;
}

export const AddNewCard = ({ onClick }: AddNewCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-dashed border-2 border-gray-300 hover:border-blue-400"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Nouveau produit
            </p>
            <p className="text-xs text-gray-500">
              ⌘+Shift+P
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
