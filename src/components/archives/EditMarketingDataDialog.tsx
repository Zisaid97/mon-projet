
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditMarketingDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    date: string;
    spend_usd: number;
    leads: number;
    deliveries: number;
    margin_per_order: number;
  };
  exchangeRate: number;
}

export function EditMarketingDataDialog({ 
  isOpen, 
  onClose, 
  data, 
  exchangeRate 
}: EditMarketingDataDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    spend_usd: data.spend_usd,
    leads: data.leads,
    deliveries: data.deliveries,
    margin_per_order: data.margin_per_order,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("marketing_performance")
        .update({
          spend_usd: formData.spend_usd,
          leads: formData.leads,
          deliveries: formData.deliveries,
          margin_per_order: formData.margin_per_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) throw error;

      toast({
        title: "Succès ✅",
        description: "Les données marketing ont été mises à jour avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ["archive_marketing"] });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier les données marketing</DialogTitle>
          <DialogDescription>
            Modifiez les données pour le {new Date(data.date).toLocaleDateString("fr-FR")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spend_usd">Dépenses (USD)</Label>
              <Input
                id="spend_usd"
                type="number"
                step="0.01"
                value={formData.spend_usd}
                onChange={(e) => handleInputChange("spend_usd", e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ≈ {(formData.spend_usd * exchangeRate).toFixed(2)} DH
              </p>
            </div>
            
            <div>
              <Label htmlFor="leads">Leads</Label>
              <Input
                id="leads"
                type="number"
                value={formData.leads}
                onChange={(e) => handleInputChange("leads", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="deliveries">Livraisons</Label>
              <Input
                id="deliveries"
                type="number"
                value={formData.deliveries}
                onChange={(e) => handleInputChange("deliveries", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="margin_per_order">Marge/commande (USD)</Label>
              <Input
                id="margin_per_order"
                type="number"
                step="0.01"
                value={formData.margin_per_order}
                onChange={(e) => handleInputChange("margin_per_order", e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ≈ {(formData.margin_per_order * exchangeRate).toFixed(2)} DH
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
