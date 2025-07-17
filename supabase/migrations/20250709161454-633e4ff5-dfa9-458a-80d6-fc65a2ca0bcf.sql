
-- Ajouter la colonne external_links à la table products
ALTER TABLE public.products 
ADD COLUMN external_links TEXT[] DEFAULT '{}';
