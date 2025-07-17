
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { useUpdateProductSpendAttribution } from "@/hooks/useProductSpendAttribution";
import { ProductSpendAttribution, ATTRIBUTION_PLATFORMS } from "@/types/product-spend-attribution";
import { toast } from "@/hooks/use-toast";

interface EditProductSpendAttributionDialogProps {
  attribution: ProductSpendAttribution | null;
  onClose: () => void;
}

export default function EditProductSpendAttributionDialog({
  attribution,
  onClose,
}: EditProductSpendAttributionDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customProductName, setCustomProductName] = useState("");
  const [useCustomProduct, setUseCustomProduct] = useState(false);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");

  const { data: products = [] } = useProducts();
  const updateMutation = useUpdateProductSpendAttribution();

  // Initialiser le formulaire avec les données de l'attribution
  useEffect(() => {
    if (attribution) {
      const existingProduct = products.find(p => p.name === attribution.product_name);
      
      if (existingProduct) {
        setSelectedProduct(attribution.product_name);
        setUseCustomProduct(false);
        setCustomProductName("");
      } else {
        setUseCustomProduct(true);
        setCustomProductName(attribution.product_name);
        setSelectedProduct("");
      }

      setAmount(attribution.amount_spent_mad.toString());
      setStartDate(new Date(attribution.start_date));
      setEndDate(new Date(attribution.end_date));
      setPlatform(attribution.platform);
      setNotes(attribution.notes || "");
    }
  }, [attribution, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attribution) return;

    const productName = useCustomProduct ? customProductName.trim() : selectedProduct;
    const amountValue = parseFloat(amount);

    if (!productName || !amountValue || !startDate || !endDate || !platform) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Erreur",
        description: "La date de début doit être antérieure à la date de fin",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedProductData = products.find(p => p.name === selectedProduct);
      
      await updateMutation.mutateAsync({
        id: attribution.id,
        product_id: selectedProductData?.id,
        product_name: productName,
        amount_spent_mad: amountValue,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        platform,
        notes: notes.trim() || undefined,
      });

      toast({
        title: "Succès ✅",
        description: `Attribution mise à jour pour "${productName}"`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'attribution",
        variant: "destructive",
      });
    }
  };

  const isFormValid = () => {
    const productName = useCustomProduct ? customProductName.trim() : selectedProduct;
    const amountValue = parseFloat(amount);
    return productName && amountValue > 0 && startDate && endDate && platform;
  };

  return (
    <Dialog open={!!attribution} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>✏️ Modifier l'attribution de dépense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélection du produit */}
            <div>
              <Label>Produit *</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Button
                  type="button"
                  variant={!useCustomProduct ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseCustomProduct(false);
                    setCustomProductName("");
                  }}
                >
                  Existant
                </Button>
                <Button
                  type="button"
                  variant={useCustomProduct ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseCustomProduct(true);
                    setSelectedProduct("");
                  }}
                >
                  Nouveau
                </Button>
              </div>

              {useCustomProduct ? (
                <Input
                  placeholder="Nom du produit"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                  required
                />
              ) : (
                <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name} (CPD: {product.cpd_category.toFixed(0)} DH)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Montant */}
            <div>
              <Label htmlFor="amount">Montant dépensé (DH) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Date de début */}
            <div>
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date de fin */}
            <div>
              <Label>Date de fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Plateforme */}
            <div>
              <Label>Source / Plateforme *</Label>
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTION_PLATFORMS.map((plat) => (
                    <SelectItem key={plat} value={plat}>
                      {plat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Note (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Commentaire libre..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Mise à jour..." : "✅ Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
