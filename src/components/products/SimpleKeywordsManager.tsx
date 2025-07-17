
import { useState, useEffect } from "react";
import { ProductKeyword } from "@/types/product";
import { useProductKeywords } from "@/hooks/useProductKeywords";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleKeywordsManagerProps {
  productId: string;
}

export const SimpleKeywordsManager = ({ productId }: SimpleKeywordsManagerProps) => {
  const [keywordsText, setKeywordsText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const {
    keywords,
    loading,
    addKeyword,
    removeKeyword,
  } = useProductKeywords(productId);

  const { toast } = useToast();

  // Charger les mots-clés existants dans la zone de texte
  useEffect(() => {
    if (keywords.length > 0) {
      const keywordsWithNotes = keywords.map(k => {
        if (k.note && k.note.trim()) {
          return `${k.keyword} (${k.note})`;
        }
        return k.keyword;
      }).join(', ');
      setKeywordsText(keywordsWithNotes);
    }
  }, [keywords]);

  const handleTextChange = (value: string) => {
    setKeywordsText(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Supprimer tous les mots-clés existants
    for (const keyword of keywords) {
      await removeKeyword(keyword.id);
    }

    // Parser et ajouter les nouveaux mots-clés
    if (keywordsText.trim()) {
      const keywordItems = keywordsText
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      for (const item of keywordItems) {
        // Vérifier s'il y a une note entre parenthèses
        const noteMatch = item.match(/^(.+?)\s*\((.+)\)$/);
        if (noteMatch) {
          const keyword = noteMatch[1].trim();
          const note = noteMatch[2].trim();
          await addKeyword({ keyword, note });
        } else {
          await addKeyword({ keyword: item, note: '' });
        }
      }
    }

    setHasChanges(false);
    
    toast({
      title: "✅ Mots-clés sauvegardés",
      description: "Les mots-clés ont été mis à jour",
    });
  };

  const copyAllKeywords = async () => {
    try {
      await navigator.clipboard.writeText(keywordsText);
      toast({
        title: "✅ Mots-clés copiés",
        description: "Tous les mots-clés ont été copiés dans le presse-papiers",
      });
    } catch (error) {
      console.error('Erreur copie mots-clés:', error);
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier les mots-clés",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Mots-clés du produit
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={copyAllKeywords}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier tout
          </Button>
        </div>

        <div className="space-y-3">
          <Textarea
            value={keywordsText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Tapez vos mots-clés ici... Séparez les par des virgules.
            
Exemples:
- bio, naturel, hydratant
- bio (produit biologique), naturel (sans chimie), hydratant (pour peau sèche)

Vous pouvez organiser vos mots-clés comme vous voulez dans cette zone de texte."
            rows={10}
            className="min-h-[200px] font-mono text-sm"
          />
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Conseils :</strong></p>
            <p>• Séparez les mots-clés par des virgules</p>
            <p>• Ajoutez des notes entre parenthèses : <em>bio (produit biologique)</em></p>
            <p>• Organisez vos mots-clés comme vous voulez dans cette zone</p>
            <p>• Cliquez sur "Copier tout" pour copier tous vos mots-clés</p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder les mots-clés
            </Button>
          </div>
        )}

        {keywords.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{keywords.length}</strong> mot(s)-clé(s) enregistré(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
