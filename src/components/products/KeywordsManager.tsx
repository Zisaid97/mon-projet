
import { useState } from "react";
import { ProductKeyword } from "@/types/product";
import { useProductKeywords } from "@/hooks/useProductKeywords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, X, Edit, Check, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KeywordRestoreModal } from "./KeywordRestoreModal";

interface KeywordsManagerProps {
  productId: string;
}

export const KeywordsManager = ({ productId }: KeywordsManagerProps) => {
  const [newKeywords, setNewKeywords] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const {
    keywords,
    loading,
    suggestions,
    addKeyword,
    removeKeyword,
    updateKeyword,
  } = useProductKeywords(productId);

  const { toast } = useToast();

  const handleAddKeywords = async () => {
    if (!newKeywords.trim()) {
      toast({
        title: "Mots-clés requis",
        description: "Veuillez saisir au moins un mot-clé",
        variant: "destructive",
      });
      return;
    }

    // Séparer les mots-clés par virgule et les nettoyer
    const keywordList = newKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    // Vérifier les doublons avant d'ajouter
    const existingKeywords = keywords.map(k => k.keyword.toLowerCase());
    const duplicateKeywords = [];
    const newUniqueKeywords = [];

    for (const keyword of keywordList) {
      if (existingKeywords.includes(keyword.toLowerCase())) {
        duplicateKeywords.push(keyword);
      } else {
        newUniqueKeywords.push(keyword);
      }
    }

    // Afficher message pour les doublons détectés
    if (duplicateKeywords.length > 0) {
      toast({
        title: "Mots-clés déjà existants",
        description: `Ces mots-clés existent déjà: ${duplicateKeywords.join(', ')}`,
        variant: "destructive",
      });
    }

    // N'ajouter que les nouveaux mots-clés
    if (newUniqueKeywords.length === 0) {
      return;
    }

    let addedCount = 0;
    let errorCount = 0;

    for (const keyword of newUniqueKeywords) {
      const success = await addKeyword({
        keyword,
        note: newNote.trim(),
      });
      
      if (success) {
        addedCount++;
      } else {
        errorCount++;
      }
    }

    if (addedCount > 0) {
      setNewKeywords("");
      setNewNote("");
      
      toast({
        title: `✅ ${addedCount} mot(s)-clé(s) ajouté(s)`,
        description: errorCount > 0 ? `${errorCount} erreur(s) lors de l'ajout` : undefined,
      });
    }
  };

  const copyKeyword = async (keyword: string) => {
    try {
      await navigator.clipboard.writeText(keyword);
      toast({
        title: "✅ Mot-clé copié",
        description: `"${keyword}" a été copié dans le presse-papiers`,
      });
    } catch (error) {
      console.error('Erreur copie mot-clé:', error);
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le mot-clé",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const currentKeywords = newKeywords.trim();
    if (currentKeywords) {
      setNewKeywords(`${currentKeywords}, ${suggestion}`);
    } else {
      setNewKeywords(suggestion);
    }
  };

  const handleEditNote = (keywordId: string, currentNote: string) => {
    setEditingId(keywordId);
    setEditingNote(currentNote);
  };

  const handleSaveNote = async (keywordId: string) => {
    await updateKeyword(keywordId, { note: editingNote });
    setEditingId(null);
    setEditingNote("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingNote("");
  };

  // Filtrer les suggestions pour ne pas montrer celles déjà utilisées
  const availableSuggestions = suggestions.filter(
    suggestion => !keywords.some(k => k.keyword.toLowerCase() === suggestion.toLowerCase())
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ajouter de nouveaux mots-clés */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <Label className="text-sm font-medium">Ajouter des mots-clés</Label>
        
        <div className="space-y-3">
          <div>
            <Input
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
              placeholder="Ex: bio, naturel, hydratant (séparer par des virgules)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddKeywords();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Séparez plusieurs mots-clés par des virgules
            </p>
          </div>

          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Note commune pour tous les mots-clés (optionnel)"
            rows={2}
          />

          <Button
            onClick={handleAddKeywords}
            disabled={!newKeywords.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter les mots-clés
          </Button>
        </div>

        {/* Suggestions */}
        {availableSuggestions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Suggestions :</Label>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Liste des mots-clés existants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Mots-clés ({keywords.length})
          </Label>
          <Button
            onClick={() => setShowRestoreModal(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Restaurer
          </Button>
        </div>

        {keywords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏷️</div>
            <p>Aucun mot-clé ajouté</p>
            <p className="text-sm">Commencez par ajouter vos premiers mots-clés</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="p-3 border border-gray-200 rounded-lg space-y-2"
              >
                {/* En-tête avec mot-clé et actions */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className="font-medium cursor-pointer hover:bg-blue-100"
                    onClick={() => copyKeyword(keyword.keyword)}
                    title="Cliquer pour copier"
                  >
                    {keyword.keyword}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyKeyword(keyword.keyword)}
                      className="h-7 w-7 p-0"
                      title="Copier le mot-clé"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditNote(keyword.id, keyword.note)}
                      className="h-7 w-7 p-0"
                      title="Éditer la note"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeKeyword(keyword.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  {editingId === keyword.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        placeholder="Note sur ce mot-clé..."
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(keyword.id)}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Sauvegarder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-600 min-h-[1.5rem] cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => handleEditNote(keyword.id, keyword.note)}
                      title="Cliquer pour éditer"
                    >
                      {keyword.note || (
                        <span className="italic text-gray-400">
                          Cliquer pour ajouter une note...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <KeywordRestoreModal
        open={showRestoreModal}
        onOpenChange={setShowRestoreModal}
        productId={productId}
      />
    </div>
  );
};
