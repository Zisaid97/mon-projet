
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProductDatabase from "@/components/products/ProductDatabase";

export const CollapsibleProductDatabase = () => {
  const [showCPDConfig, setShowCPDConfig] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button 
          onClick={() => setShowCPDConfig(!showCPDConfig)}
          variant="outline"
          className="flex items-center gap-2"
        >
          {showCPDConfig ? (
            <>
              <ChevronUp className="h-4 w-4" />
              🔼 Masquer les commissions
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              🔽 Modifier les commissions CPD
            </>
          )}
        </Button>
      </div>
      
      {showCPDConfig && (
        <div className="animate-fade-in">
          <ProductDatabase />
        </div>
      )}
    </div>
  );
};
