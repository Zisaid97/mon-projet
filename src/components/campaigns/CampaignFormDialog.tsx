import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CampaignFormFields } from "./CampaignFormFields";

export type CampaignFormData = {
  id?: string;
  name: string;
  platform: string;
  planned_budget: number;
  planned_budget_currency: string;
  estimated_leads?: number;
  estimated_deliveries?: number;
  status: string;
  cpd_category?: number | null;
  product_id?: string | null;
  date: string; // format: yyyy-MM-dd
};

type CampaignFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // calendar day
  initialValues?: CampaignFormData | null; // if editing
  onSuccess?: () => void;
  products?: { id: string; name: string }[];
};

export const CAMPAIGN_PLATFORMS = [
  { value: "Meta Ads", label: "Meta Ads" },
  { value: "Google Ads", label: "Google Ads" },
  { value: "TikTok Ads", label: "TikTok Ads" },
  { value: "Autre", label: "Autre plateforme" },
];

export const CAMPAIGN_STATUSES = [
  { value: "planifiée", label: "Planifiée" },
  { value: "en cours", label: "En cours" },
  { value: "terminée", label: "Terminée" },
];

export function CampaignFormDialog({
  open,
  onOpenChange,
  date,
  initialValues,
  onSuccess,
  products = []
}: CampaignFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const editing = !!initialValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
    setValue,
  } = useForm<CampaignFormData>({
    defaultValues: initialValues
      ? { ...initialValues }
      : {
          name: "",
          platform: "",
          planned_budget: 0,
          planned_budget_currency: "MAD",
          status: "planifiée",
          date,
        },
  });

  React.useEffect(() => {
    // Reset values when dialog opens/closes or initialValues change
    if (open) {
      reset(
        initialValues
          ? { ...initialValues }
          : {
              name: "",
              platform: "",
              planned_budget: 0,
              planned_budget_currency: "MAD",
              status: "planifiée",
              date,
            }
      );
    }
  }, [open, initialValues, reset, date]);

  const onSubmit = async (form: CampaignFormData) => {
    if (!user) return;
    const insertData = {
      ...form,
      user_id: user.id,
      cpd_category: form.cpd_category ?? null,
      product_id: form.product_id || null,
      estimated_leads: form.estimated_leads || null,
      estimated_deliveries: form.estimated_deliveries || null,
    };

    let res;
    if (editing && form.id) {
      res = await supabase
        .from("campaigns")
        .update(insertData)
        .eq("id", form.id)
        .select()
        .maybeSingle();
    } else {
      res = await supabase
        .from("campaigns")
        .insert(insertData)
        .select()
        .maybeSingle();
    }
    if (res.error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la campagne.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: editing ? "Campagne modifiée" : "Campagne ajoutée",
      description: `La campagne "${form.name}" a bien été ${editing ? "modifiée" : "créée"}.`,
    });
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier la campagne" : "Ajouter une campagne"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <CampaignFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            initialValues={initialValues}
            products={products}
            isSubmitting={isSubmitting}
          />
          <DialogFooter>
            <Button type="submit">
              {editing ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
