-- Ajouter une contrainte unique sur user_id pour la table meta_ads_integrations
-- Cela permettra de faire des upserts sans erreur

-- D'abord, supprimer les doublons potentiels s'il y en a
DELETE FROM public.meta_ads_integrations 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM public.meta_ads_integrations 
    GROUP BY user_id
);

-- Puis ajouter la contrainte unique
ALTER TABLE public.meta_ads_integrations 
ADD CONSTRAINT meta_ads_integrations_user_id_unique UNIQUE (user_id);