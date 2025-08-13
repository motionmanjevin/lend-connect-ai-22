-- Add payment_methods JSON field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN payment_methods JSONB DEFAULT '[]'::jsonb;