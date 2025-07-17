
-- Add product_id column to profit_tracking table to link with products table
ALTER TABLE public.profit_tracking ADD COLUMN product_id UUID;

-- Add foreign key constraint from profit_tracking to products
ALTER TABLE public.profit_tracking
ADD CONSTRAINT profit_tracking_product_id_fkey
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- Create an index on the new foreign key column for better performance
CREATE INDEX idx_profit_tracking_product_id ON public.profit_tracking(product_id);

-- Backfill product_id for existing rows in profit_tracking
-- This ensures existing data is correctly linked to products.
UPDATE public.profit_tracking pt
SET product_id = p.id
FROM public.products p
WHERE pt.user_id = p.user_id AND pt.product_name = p.name;
