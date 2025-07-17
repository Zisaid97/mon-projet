
-- Ajouter une colonne pour distinguer les livraisons normales des livraisons décalées
ALTER TABLE public.profit_tracking 
ADD COLUMN source_type text NOT NULL DEFAULT 'normale';

-- Ajouter une contrainte pour valider les valeurs
ALTER TABLE public.profit_tracking 
ADD CONSTRAINT check_source_type 
CHECK (source_type IN ('normale', 'décalée'));

-- Ajouter un commentaire pour clarifier l'usage
COMMENT ON COLUMN public.profit_tracking.source_type IS 'Type de livraison: normale (saisie standard) ou décalée (livraison du mois en cours provenant de leads précédents)';
