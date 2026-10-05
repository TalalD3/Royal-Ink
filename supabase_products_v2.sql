-- ══════════════════════════════════════════════════════════════════════
-- ROYAL INK — PRODUCTS v2: product pages, structured specs, notes in 3 languages
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run more than once. Existing products keep all their data.
-- ══════════════════════════════════════════════════════════════════════

-- 1. New columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notes_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Product page address: brand + code (e.g. "hp-ce285a"), unique
UPDATE public.products
SET slug = trim(both '-' from regexp_replace(lower(brand || '-' || coalesce(nullif(sku, ''), id::text)), '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Two products with the same brand + code: add -2, -3… to the later ones
WITH dup AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS n
  FROM public.products
)
UPDATE public.products p
SET slug = dup.slug || '-' || dup.n
FROM dup
WHERE p.id = dup.id AND dup.n > 1;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug);

-- 3. The existing Arabic note becomes the Arabic entry of notes_i18n
UPDATE public.products
SET notes_i18n = jsonb_build_object('ar', notes)
WHERE notes IS NOT NULL AND notes <> '' AND (notes_i18n = '{}'::jsonb OR notes_i18n IS NULL);

-- 4. Categories now include: printer, toner, cartridge, ink, drum_unit, fuser, ribbon, spare_parts
COMMENT ON COLUMN public.products.category IS 'printer | toner | cartridge | ink | drum_unit | fuser | ribbon | spare_parts';
COMMENT ON COLUMN public.products.specs IS 'Structured specs, e.g. {"oemRef":"CE285A","yieldPages":"1600","warrantyMonths":"12"} — labels in src/i18n/specs.ts';
COMMENT ON COLUMN public.products.notes_i18n IS 'Optional hand-written note per language: {"ar":"…","fr":"…","en":"…"}';
