
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create policy for product images bucket
CREATE POLICY "Users can upload their own product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add image_url and product_link columns to existing products table
ALTER TABLE public.products 
ADD COLUMN image_url text,
ADD COLUMN product_link text;

-- Create table for product keywords
CREATE TABLE IF NOT EXISTS public.product_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  note TEXT DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, keyword)
);

-- Enable RLS on product_keywords
ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for product_keywords
CREATE POLICY "Users can view their own product keywords" 
  ON public.product_keywords 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product keywords" 
  ON public.product_keywords 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product keywords" 
  ON public.product_keywords 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product keywords" 
  ON public.product_keywords 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_product_keywords_updated_at
  BEFORE UPDATE ON public.product_keywords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
