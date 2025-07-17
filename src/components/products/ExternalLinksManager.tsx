
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExternalLinksManagerProps {
  links: string[];
  onLinksChange: (links: string[]) => void;
  disabled?: boolean;
}

export const ExternalLinksManager = ({ links, onLinksChange, disabled }: ExternalLinksManagerProps) => {
  const [newLink, setNewLink] = useState("");
  const { toast } = useToast();

  const addLink = () => {
    if (!newLink.trim()) {
      toast({
        title: "Lien requis",
        description: "Veuillez saisir un lien",
        variant: "destructive",
      });
      return;
    }

    // Validation URL
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(newLink.trim())) {
      toast({
        title: "URL invalide",
        description: "L'URL doit commencer par http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    const updatedLinks = [...links, newLink.trim()];
    onLinksChange(updatedLinks);
    setNewLink("");
    
    toast({
      title: "✅ Lien ajouté",
      description: "Le lien externe a été ajouté",
    });
  };

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    onLinksChange(updatedLinks);
    
    toast({
      title: "✅ Lien supprimé",
      description: "Le lien externe a été retiré",
    });
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "✅ Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      });
    } catch (error) {
      console.error('Erreur copie lien:', error);
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const openLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <Label>Liens externes</Label>
      
      {/* Ajouter un nouveau lien */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        <Label className="text-sm font-medium">Ajouter un lien externe</Label>
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com/produit"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <Button
            onClick={addLink}
            disabled={disabled || !newLink.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Liste des liens existants */}
      {links.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Liens existants ({links.length})
          </Label>
          <div className="space-y-2">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="flex-1 text-sm text-gray-600 truncate cursor-pointer hover:text-blue-600"
                  onClick={() => copyLink(link)}
                  title="Cliquer pour copier le lien"
                >
                  {link}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(link)}
                    className="h-7 w-7 p-0"
                    title="Copier le lien"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openLink(link)}
                    className="h-7 w-7 p-0"
                    title="Ouvrir le lien"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLink(index)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Supprimer"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucun lien externe ajouté
        </div>
      )}
    </div>
  );
};
