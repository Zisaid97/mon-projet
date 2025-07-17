
import { useCurrentOrganization } from "@/hooks/useCurrentOrganization";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import OrganizationSelector from "./OrganizationSelector";

export default function CreateOrSelectOrganization({
  onDone,
}: {
  onDone?: () => void;
}) {
  const { organizations, createOrganization, isLoading } = useCurrentOrganization();
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) return <div className="flex justify-center p-6">Chargement...</div>;

  // Si déjà une organisation : sélecteur et option de création
  if (organizations.length > 0 && !showCreateForm) {
    return (
      <div className="p-6 rounded-lg bg-white shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Espace de travail</h2>
        
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Organisation actuelle
          </Label>
          <OrganizationSelector />
        </div>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCreateForm(true)}
          >
            + Créer une nouvelle organisation
          </Button>
          
          {onDone && (
            <Button onClick={onDone} className="w-full">
              Continuer
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Formulaire de création
  return (
    <div className="p-6 rounded-lg bg-white shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {organizations.length > 0 ? "Nouvelle organisation" : "Créer votre espace entreprise"}
      </h2>
      
      {organizations.length > 0 && (
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setShowCreateForm(false)}
        >
          ← Retour à la sélection
        </Button>
      )}
      
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await createOrganization.mutateAsync({ 
              name: newOrgName,
              description: newOrgDescription 
            });
            setNewOrgName("");
            setNewOrgDescription("");
            setShowCreateForm(false);
            onDone?.();
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <Label htmlFor="orgName">Nom de l'organisation *</Label>
          <Input
            id="orgName"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Nom de l'entreprise"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="orgDescription">Description (optionnel)</Label>
          <Textarea
            id="orgDescription"
            value={newOrgDescription}
            onChange={(e) => setNewOrgDescription(e.target.value)}
            placeholder="Décrivez votre organisation..."
            rows={3}
          />
        </div>
        
        <Button type="submit" disabled={loading || !newOrgName.trim()}>
          {loading ? "Création..." : "Créer l'organisation"}
        </Button>
      </form>
    </div>
  );
}
