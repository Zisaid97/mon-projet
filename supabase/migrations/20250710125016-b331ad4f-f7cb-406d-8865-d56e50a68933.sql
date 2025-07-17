-- Add facebook_keywords column to products table
ALTER TABLE public.products 
ADD COLUMN facebook_keywords text[] DEFAULT '{}';

-- Update the column to not be null and have a proper default
ALTER TABLE public.products 
ALTER COLUMN facebook_keywords SET NOT NULL,
ALTER COLUMN facebook_keywords SET DEFAULT '{}';