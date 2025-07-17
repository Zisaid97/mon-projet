
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Gift, Save, Loader2 } from "lucide-react";
import { useMonthlyBonus } from "@/hooks/useMonthlyBonus";

interface MonthlyBonusCardProps {
  selectedDate?: Date;
}

export function MonthlyBonusCard({ selectedDate }: MonthlyBonusCardProps) {
  const { bonus, isLoading, isSaving, saveBonus } = useMonthlyBonus(selectedDate);
  const [inputValue, setInputValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    setInputValue(bonus.toString());
  }, [bonus]);

  const handleSave = async () => {
    const amount = parseFloat(inputValue) || 0;
    await saveBonus(amount);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(bonus.toString());
    setIsEditing(false);
  };

  const targetDate = selectedDate || new Date();
  const monthName = targetDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800 flex items-center gap-2">
          <Gift className="h-5 w-5" />
          🎁 Bonus du mois - {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {bonus.toFixed(0)} DH
              </div>
              <div className="text-sm text-purple-500">
                Bonus ajouté au profit net
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              Modifier
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bonus-amount">Montant du bonus (DH)</Label>
              <Input
                id="bonus-amount"
                type="number"
                step="1"
                min="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: 2000"
                className="text-right"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
        
        <div className="bg-purple-100 p-3 rounded-lg">
          <div className="text-xs text-purple-700">
            💡 Ce bonus sera automatiquement ajouté au calcul du profit net mensuel dans les résumés et tableaux de bord.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
