
-- Create table for user-defined products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpd_category DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own products"
  ON public.products
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON public.products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON public.products
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON public.products
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
