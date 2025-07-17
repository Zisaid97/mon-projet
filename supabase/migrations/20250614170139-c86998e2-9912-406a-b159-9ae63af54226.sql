
-- Augmenter la précision de la colonne commission_total pour permettre des montants plus élevés
ALTER TABLE public.profit_tracking 
ALTER COLUMN commission_total TYPE NUMERIC(10,2);

-- Également augmenter la précision pour cpd_category au cas où
ALTER TABLE public.profit_tracking 
ALTER COLUMN cpd_category TYPE NUMERIC(10,2);
