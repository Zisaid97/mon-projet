-- Ajouter une contrainte unique sur user_id pour la table meta_ads_integrations
-- Cela permettra de faire des upserts sans erreur

-- D'abord, supprimer les doublons potentiels s'il y en a
DELETE FROM public.meta_ads_integrations a
WHERE EXISTS (
    SELECT 1 FROM public.meta_ads_integrations b 
    WHERE b.user_id = a.user_id 
    AND b.created_at > a.created_at
);

-- Puis ajouter la contrainte unique
ALTER TABLE public.meta_ads_integrations 
ADD CONSTRAINT meta_ads_integrations_user_id_unique UNIQUE (user_id);