
-- Mettre à jour la table attributions_meta pour remplacer 'month' par 'date'
ALTER TABLE attributions_meta 
RENAME COLUMN month TO date;
