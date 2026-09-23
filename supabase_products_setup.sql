-- ══════════════════════════════════════════════════════════════════════
-- ROYAL INK — PRODUCTS & PRINTERS DATABASE TABLE SETUP
-- Execute this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ══════════════════════════════════════════════════════════════════════

-- 1. Create the products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL, -- 'printer', 'toner', 'ink', 'drum_unit', 'spare_parts'
  sku TEXT,
  color TEXT DEFAULT 'black',
  image_url TEXT,
  compatible_printers TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public read access for visitors & compatibility search
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products"
ON public.products FOR SELECT
TO public
USING (true);

-- 4. Policy: Authenticated admin & service role full write access
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.products;
CREATE POLICY "Allow full access for authenticated users"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Insert all current initial products (Printers, Toners, Inks, Drums)
INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'طابعة ليزر HP LaserJet Pro P1102',
  'HP',
  'printer',
  'CE651A',
  'black',
  ARRAY['HP LaserJet Pro P1102']::TEXT[],
  'طابعة ليزرية شخصية ومكتبية أحادية اللون، سرعة طباعة تصل إلى 18 صفحة/دقيقة، متوافقة تماماً مع خراطيش HP 85A (CE285A)',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'طابعة ليزر HP LaserJet Pro M404dn',
  'HP',
  'printer',
  'W1A53A',
  'black',
  ARRAY['HP LaserJet Pro M404dn']::TEXT[],
  'طابعة ليزر أعمال عالية الأداء، سرعة 38 صفحة/دقيقة مع دوبلكس وشبكة إيثرنت، تدعم خراطيش HP 59A (CF259A) و 59X',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'طابعة ليزر Canon i-SENSYS LBP6030B',
  'Canon',
  'printer',
  '8468B006',
  'black',
  ARRAY['Canon i-SENSYS LBP6030B', 'Canon i-SENSYS LBP6030']::TEXT[],
  'طابعة ليزرية أحادية اللون مدمجة وموفرة للمساحة والطاقة، متوافقة مع خرطوشة Canon 725 (CRG-725)',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'طابعة ملونة متعددة الوظائف Epson EcoTank L3150 Wi-Fi',
  'Epson',
  'printer',
  'C11CG86405',
  'multi',
  ARRAY['Epson EcoTank L3150']::TEXT[],
  'طابعة خزان حبر ذكية 3 في 1 (طباعة، مسح، نسخ) مع اتصال Wi-Fi، تدعم عبوات حبر Epson 103 بألوانها الأربعة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'طابعة متعددة الوظائف Brother DCP-L2540DW',
  'Brother',
  'printer',
  'DCP-L2540DW',
  'black',
  ARRAY['Brother DCP-L2540DW']::TEXT[],
  'طابعة ليزر مدمجة 3 في 1 مع تغذية آلية للمستندات ADF، طباعة على الوجهين وشبكة لاسلكية، متوافقة مع تونر Brother TN-2305 ودرام DR-2305',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'طابعة ليزر لاسلكية Pantum P2500W Wi-Fi',
  'Pantum',
  'printer',
  'P2500W',
  'black',
  ARRAY['Pantum P2500W']::TEXT[],
  'طابعة ليزر اقتصادية مدمجة مع واي فاي وتطبيق للهواتف، متوافقة مع خراطيش Pantum PC-210EV',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink HP 85A',
  'HP',
  'toner',
  'CE285A',
  'black',
  ARRAY['HP LaserJet Pro P1102', 'HP LaserJet Pro P1102w', 'HP LaserJet Pro M1132 MFP', 'HP LaserJet Pro M1212nf MFP', 'HP LaserJet Pro M1217nfw MFP', 'HP LaserJet Pro P1100']::TEXT[],
  'إنتاجية قياسية 1600 صفحة بتغطية 5% — سواد داكن ونصوص فائقة الوضوح',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink HP 78A',
  'HP',
  'toner',
  'CE278A',
  'black',
  ARRAY['HP LaserJet Pro P1566', 'HP LaserJet Pro P1606dn', 'HP LaserJet Pro M1536dnf MFP']::TEXT[],
  'إنتاجية 2100 صفحة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink HP 05A',
  'HP',
  'toner',
  'CE505A',
  'black',
  ARRAY['HP LaserJet P2035', 'HP LaserJet P2035n', 'HP LaserJet P2055', 'HP LaserJet P2055d', 'HP LaserJet P2055dn']::TEXT[],
  'إنتاجية عالية 2700 صفحة ملائمة للشركات والمكاتب',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink HP 26A',
  'HP',
  'toner',
  'CF226A',
  'black',
  ARRAY['HP LaserJet Pro M402d', 'HP LaserJet Pro M402dn', 'HP LaserJet Pro M402n', 'HP LaserJet Pro MFP M426dw', 'HP LaserJet Pro MFP M426fdn', 'HP LaserJet Pro MFP M426fdw']::TEXT[],
  'تقنية متطورة وإنتاجية 3100 صفحة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink HP 59A',
  'HP',
  'toner',
  'CF259A',
  'black',
  ARRAY['HP LaserJet Pro M404dn', 'HP LaserJet Pro M404dw', 'HP LaserJet Pro M404n', 'HP LaserJet Pro MFP M428dw', 'HP LaserJet Pro MFP M428fdn', 'HP LaserJet Pro MFP M428fdw']::TEXT[],
  'جيل جديد سريع وسلس، إنتاجية 3000 صفحة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink Canon 725',
  'Canon',
  'toner',
  'CRG-725',
  'black',
  ARRAY['Canon i-SENSYS LBP6000', 'Canon i-SENSYS LBP6020', 'Canon i-SENSYS LBP6030', 'Canon i-SENSYS LBP6030B', 'Canon i-SENSYS LBP6030w', 'Canon i-SENSYS MF3010']::TEXT[],
  'أكثر الموديلات طلباً لطابعات كانون الأكثر انتشاراً في الجزائر، 1600 صفحة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink Canon 737',
  'Canon',
  'toner',
  'CRG-737',
  'black',
  ARRAY['Canon i-SENSYS MF211', 'Canon i-SENSYS MF212w', 'Canon i-SENSYS MF216n', 'Canon i-SENSYS MF217w', 'Canon i-SENSYS MF226dn', 'Canon i-SENSYS MF229dw', 'Canon i-SENSYS MF231', 'Canon i-SENSYS MF232w', 'Canon i-SENSYS MF237w', 'Canon i-SENSYS MF244dw', 'Canon i-SENSYS MF247dw', 'Canon i-SENSYS MF249dw']::TEXT[],
  'إنتاجية 2400 صفحة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink Canon 057',
  'Canon',
  'toner',
  'CRG-057',
  'black',
  ARRAY['Canon i-SENSYS LBP223dw', 'Canon i-SENSYS LBP226dw', 'Canon i-SENSYS LBP228x', 'Canon i-SENSYS MF443dw', 'Canon i-SENSYS MF445dw', 'Canon i-SENSYS MF446x', 'Canon i-SENSYS MF449x']::TEXT[],
  'إنتاجية 3100 صفحة لأجهزة كانون المتعددة المهام الحديثة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink Brother TN-2305 / TN-2320',
  'Brother',
  'toner',
  'TN-2305',
  'black',
  ARRAY['Brother HL-L2300D', 'Brother HL-L2320D', 'Brother HL-L2340DW', 'Brother HL-L2360DN', 'Brother HL-L2365DW', 'Brother DCP-L2500D', 'Brother DCP-L2520DW', 'Brother DCP-L2540DN', 'Brother DCP-L2540DW', 'Brother MFC-L2700DW', 'Brother MFC-L2720DW', 'Brother MFC-L2740DW']::TEXT[],
  'إنتاجية 2600 صفحة لطابعات براذر الليزرية',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'وحدة أسطوانة تصوير Brother DR-2305 (Drum Unit)',
  'Brother',
  'drum_unit',
  'DR-2305',
  'black',
  ARRAY['Brother HL-L2320D', 'Brother HL-L2365DW', 'Brother DCP-L2540DW', 'Brother MFC-L2700DW']::TEXT[],
  'أسطوانة تصوير عالية التحمل بعمر افتراضي حتى 12,000 صفحة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'عبوة حبر سائل Royal Ink Epson 103 — أسود',
  'Epson',
  'ink',
  '103-BK',
  'black',
  ARRAY['Epson EcoTank L3110', 'Epson EcoTank L3111', 'Epson EcoTank L3150', 'Epson EcoTank L3151', 'Epson EcoTank L3156', 'Epson EcoTank L3160', 'Epson EcoTank L5190', 'Epson EcoTank L1110']::TEXT[],
  'حبر سائل فائق النقاء 65 مل — يطبع حتى 4500 صفحة دون انسداد للرؤوس',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'عبوة حبر سائل Royal Ink Epson 103 — أزرق (Cyan)',
  'Epson',
  'ink',
  '103-C',
  'cyan',
  ARRAY['Epson EcoTank L3110', 'Epson EcoTank L3150', 'Epson EcoTank L3156', 'Epson EcoTank L5190']::TEXT[],
  'حبر سائل 65 مل ألوان زاهية ومطابقة للأصل',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'عبوة حبر سائل Royal Ink Epson 103 — أرجواني (Magenta)',
  'Epson',
  'ink',
  '103-M',
  'magenta',
  ARRAY['Epson EcoTank L3110', 'Epson EcoTank L3150', 'Epson EcoTank L3156', 'Epson EcoTank L5190']::TEXT[],
  'حبر سائل 65 مل ألوان زاهية',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'عبوة حبر سائل Royal Ink Epson 103 — أصفر (Yellow)',
  'Epson',
  'ink',
  '103-Y',
  'yellow',
  ARRAY['Epson EcoTank L3110', 'Epson EcoTank L3150', 'Epson EcoTank L3156', 'Epson EcoTank L5190']::TEXT[],
  'حبر سائل 65 مل',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink Kyocera TK-1170',
  'Kyocera',
  'toner',
  'TK-1170',
  'black',
  ARRAY['Kyocera ECOSYS M2040dn', 'Kyocera ECOSYS M2540dn', 'Kyocera ECOSYS M2640idw']::TEXT[],
  'إنتاجية ضخمة 7200 صفحة لأجهزة كواسيرا الشاقة',
  true
);

INSERT INTO public.products (name, brand, category, sku, color, compatible_printers, notes, is_active)
VALUES (
  'خرطوشة حبر ليزر Royal Ink Pantum PC-211EV',
  'Pantum',
  'toner',
  'PC-211EV',
  'black',
  ARRAY['Pantum P2500', 'Pantum P2500W', 'Pantum M6500', 'Pantum M6500NW', 'Pantum M6550NW', 'Pantum M6600NW']::TEXT[],
  'إنتاجية 1600 صفحة مع شريحة ذكية متوافقة',
  true
);

