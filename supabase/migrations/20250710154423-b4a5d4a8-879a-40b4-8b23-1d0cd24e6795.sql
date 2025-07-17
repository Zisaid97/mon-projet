-- Supprimer les doublons dans les facebook_keywords des produits
UPDATE products 
SET facebook_keywords = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(facebook_keywords)
  )
)
WHERE facebook_keywords IS NOT NULL;