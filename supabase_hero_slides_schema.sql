-- ══════════════════════════════════════════════════════════════════════
-- ROYAL INK — HERO SLIDES SCHEMA
-- Execute this script in your Supabase Dashboard -> SQL Editor -> Run
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY DEFAULT ('slide-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
  created_at TIMESTAMPTZ DEFAULT now(),
  sort_order INT DEFAULT 1,
  image_url TEXT NOT NULL,
  overlay_opacity INT DEFAULT 50,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  text_align TEXT DEFAULT 'center', -- 'right', 'center', 'left'
  buttons JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for website visitors to see active slides)
CREATE POLICY "Allow public read access on hero_slides"
ON public.hero_slides FOR SELECT
TO public
USING (true);

-- Allow authenticated users / service-role full write access
CREATE POLICY "Allow full access for authenticated users on hero_slides"
ON public.hero_slides FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Initial Seed Data
INSERT INTO public.hero_slides (id, sort_order, image_url, overlay_opacity, title, subtitle, text_align, buttons, is_active)
VALUES 
  (
    'default-1',
    1,
    '/images/ink-cartridges.jpg',
    45,
    'مستلزمات طباعة احترافية' || E'\n' || 'بأعلى جودة',
    'روايال إنك شريكك في توفير مستلزمات طباعة عالية الجودة ومتوافقة مع أبرز الطابعات العالمية.',
    'right',
    '[{"text": "تواصل معنا", "href": "/contact", "variant": "primary"}, {"text": "تعرف علينا", "href": "/about", "variant": "outline"}]'::jsonb,
    true
  ),
  (
    'default-2',
    2,
    '/images/hero-printers-supplies.jpg',
    50,
    'ابحث عن الحبر المتوافق' || E'\n' || 'مع طابعتك',
    'أدخل موديل طابعتك واحصل فوراً على المنتج المتوافق المضمون — بلا حيرة، وبلا خطأ في الاختيار.',
    'center',
    '[{"text": "افتح دليل التوافق", "href": "/compatibility", "variant": "primary"}]'::jsonb,
    true
  ),
  (
    'default-3',
    3,
    '/images/algeria-distribution-cover.jpg',
    55,
    'شبكة توزيع وطنية' || E'\n' || 'تغطي 58 ولاية',
    'تتوفر منتجات روايال إنك في أغلب ولايات الوطن عبر شبكة واسعة من الموزعين ونقاط البيع.',
    'right',
    '[{"text": "اكتشف نقاط البيع", "href": "/find-us", "variant": "primary"}]'::jsonb,
    true
  ),
  (
    'default-4',
    4,
    '/images/timeline-workshop.jpg',
    60,
    'من ورشة صغيرة' || E'\n' || 'إلى علامة وطنية',
    'أكثر من 15 سنة من الخبرة في مجال الطباعة والتوزيع — اكتشف مسيرتنا الكاملة.',
    'center',
    '[{"text": "اكتشف قصتنا", "href": "/about", "variant": "primary"}]'::jsonb,
    true
  ),
  (
    'default-5',
    5,
    '/images/hero-office.jpg',
    50,
    'زوروا متجرنا' || E'\n' || 'في مدينة العلمة',
    'تعرف على تشكيلتنا الكاملة من الطابعات ومستلزمات الطباعة في معرضنا.',
    'center',
    '[{"text": "موقعنا على الخريطة", "href": "/find-us", "variant": "primary"}, {"text": "اتصل بنا", "href": "/contact", "variant": "outline"}]'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;
