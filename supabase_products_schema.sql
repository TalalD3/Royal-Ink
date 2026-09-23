-- ══════════════════════════════════════════════════════════════════════
-- ROYAL INK — PRODUCTS & PRINTER COMPATIBILITY SCHEMA
-- Execute this script in your Supabase Dashboard -> SQL Editor -> Run
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL, -- 'toner', 'ink', 'drum_unit', 'spare_parts'
  sku TEXT,
  color TEXT DEFAULT 'black',
  image_url TEXT,
  compatible_printers TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for website visitors to search compatible products)
CREATE POLICY "Allow public read access on products"
ON public.products FOR SELECT
TO public
USING (true);

-- Allow authenticated users / service-role full write access
CREATE POLICY "Allow full access for authenticated users"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
