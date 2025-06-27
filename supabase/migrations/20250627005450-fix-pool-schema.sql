-- Fix investment_pools table schema to make target_amount nullable
ALTER TABLE public.investment_pools 
ALTER COLUMN target_amount DROP NOT NULL;

-- Add default value for target_amount
ALTER TABLE public.investment_pools 
ALTER COLUMN target_amount SET DEFAULT 0;

-- Update existing records with null target_amount to 0
UPDATE public.investment_pools 
SET target_amount = 0 
WHERE target_amount IS NULL; 