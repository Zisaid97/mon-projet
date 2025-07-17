
-- Create the sales_data table to store sales information
CREATE TABLE public.sales_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_order_id TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  sales_channel TEXT NOT NULL DEFAULT '',
  tracking_number TEXT NOT NULL DEFAULT '',
  customer TEXT NOT NULL DEFAULT '',
  products TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT '',
  deposit NUMERIC NOT NULL DEFAULT 0,
  customer_shipping TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  confirmation_status TEXT NOT NULL DEFAULT '',
  confirmation_note TEXT NOT NULL DEFAULT '',
  delivery_agent TEXT NOT NULL DEFAULT '',
  delivery_status TEXT NOT NULL DEFAULT '',
  delivery_note TEXT NOT NULL DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own sales data
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own sales data
CREATE POLICY "Users can view their own sales data" 
  ON public.sales_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own sales data
CREATE POLICY "Users can create their own sales data" 
  ON public.sales_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own sales data
CREATE POLICY "Users can update their own sales data" 
  ON public.sales_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own sales data
CREATE POLICY "Users can delete their own sales data" 
  ON public.sales_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_sales_data_updated_at
  BEFORE UPDATE ON public.sales_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
