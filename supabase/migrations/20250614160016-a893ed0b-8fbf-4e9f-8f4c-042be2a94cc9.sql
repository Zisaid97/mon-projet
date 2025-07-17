
-- Modifier la table profit_tracking pour supporter les sous-quantités avec noms de produits
-- Supprimer la contrainte unique actuelle
ALTER TABLE public.profit_tracking DROP CONSTRAINT IF EXISTS profit_tracking_user_id_date_cpd_category_key;

-- Ajouter une colonne pour le nom du produit
ALTER TABLE public.profit_tracking ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Créer une nouvelle contrainte unique incluant le nom du produit
ALTER TABLE public.profit_tracking ADD CONSTRAINT profit_tracking_user_id_date_cpd_category_product_unique 
  UNIQUE(user_id, date, cpd_category, product_name);

-- Mettre à jour les enregistrements existants pour avoir un nom de produit par défaut
UPDATE public.profit_tracking 
SET product_name = 'Produit sans nom' 
WHERE product_name IS NULL;

-- Rendre la colonne product_name obligatoire maintenant qu'elle a des valeurs
ALTER TABLE public.profit_tracking ALTER COLUMN product_name SET NOT NULL;
