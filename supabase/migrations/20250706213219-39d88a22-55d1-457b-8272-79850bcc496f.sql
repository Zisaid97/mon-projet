-- Activer les mises à jour en temps réel pour les attributions marketing et livraisons

-- Activer REPLICA IDENTITY FULL pour capturer les données complètes lors des changements
ALTER TABLE public.product_country_deliveries REPLICA IDENTITY FULL;
ALTER TABLE public.marketing_spend_attrib REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime pour activer les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_country_deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketing_spend_attrib;