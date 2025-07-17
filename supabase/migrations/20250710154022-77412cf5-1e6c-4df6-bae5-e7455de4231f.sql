-- Supprimer les doublons existants en gardant le plus récent
DELETE FROM product_keywords 
WHERE id NOT IN (
  SELECT DISTINCT ON (product_id, user_id, LOWER(keyword)) id
  FROM product_keywords
  ORDER BY product_id, user_id, LOWER(keyword), created_at DESC
);

-- Ajouter une contrainte unique pour empêcher les doublons futurs
ALTER TABLE product_keywords 
ADD CONSTRAINT unique_product_keyword_per_user 
UNIQUE (product_id, user_id, keyword);