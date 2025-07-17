-- Restaurer le produit "ts les store"
INSERT INTO public.products (name, cpd_category, user_id, facebook_keywords)
SELECT 'ts les store', 200, auth.uid(), ARRAY[]::text[]
WHERE auth.uid() IS NOT NULL;