
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAMPAIGN_PLATFORMS, CAMPAIGN_STATUSES, CampaignFormData } from "./CampaignFormDialog";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";

// Props : passage des hooks réactifs, erreurs, setters, et listes de valeurs
type CampaignFormFieldsProps = {
  register: UseFormRegister<CampaignFormData>;
  errors: FieldErrors<CampaignFormData>;
  setValue: UseFormSetValue<CampaignFormData>;
  initialValues?: CampaignFormData | null;
  products?: { id: string; name: string }[];
  isSubmitting: boolean;
};

export const CampaignFormFields: React.FC<CampaignFormFieldsProps> = ({
  register,
  errors,
  setValue,
  initialValues,
  products = [],
  isSubmitting,
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <Input
          {...register("name", { required: true })}
          placeholder="Nom de la campagne"
          disabled={isSubmitting}
        />
        {errors.name && (
          <span className="text-xs text-destructive">Nom requis</span>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Plateforme</label>
        <Select
          value={initialValues?.platform || ""}
          onValueChange={val => setValue("platform", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plateforme…" />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_PLATFORMS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Budget</label>
          <Input
            type="number"
            {...register("planned_budget", { required: true, min: 0 })}
            placeholder="Budget"
            disabled={isSubmitting}
          />
          {errors.planned_budget && (
            <span className="text-xs text-destructive">Obligatoire</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Devise</label>
          <Select
            value={initialValues?.planned_budget_currency || "MAD"}
            onValueChange={val => setValue("planned_budget_currency", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Devise…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MAD">MAD</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Objectif (leads)</label>
          <Input
            type="number"
            {...register("estimated_leads")}
            placeholder="Ex. 20"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Objectif (livraisons)</label>
          <Input
            type="number"
            {...register("estimated_deliveries")}
            placeholder="Ex. 10"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Statut</label>
        <Select
          value={initialValues?.status || "planifiée"}
          onValueChange={val => setValue("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut…" />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_STATUSES.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Produit lié (optionnel)</label>
        <Select
          value={
            initialValues?.product_id === undefined || initialValues?.product_id === null
              ? "none"
              : initialValues.product_id
          }
          onValueChange={val => setValue("product_id", val === "none" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aucun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input
          type="date"
          {...register("date", { required: true })}
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};
