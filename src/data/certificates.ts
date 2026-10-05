/* ══════════════════════════════════════════════════════════════════════
   CERTIFICATES — Royal Ink's quality, safety and environmental marks
   Shared by the quality page and the (older) certificates carousel.
   ══════════════════════════════════════════════════════════════════════ */

export interface CertificateItem {
  id: string;
  code: string;
  title: string;
  englishTitle?: string;
  description: string;
  logo: string;
  badge?: string;
}

export const COMPANY_CERTIFICATES: CertificateItem[] = [
  {
    id: "iso-9001",
    code: "ISO 9001",
    title: "نظام إدارة الجودة الدولي",
    englishTitle: "Quality Management System — ISO 9001",
    description:
      "شهادة اعتماد دولية تؤكد تطبيق معايير إدارة وتوكيد الجودة الصارمة لضمان ثبات أداء وموثوقية كل خرطوشة طباعة.",
    logo: "/images/certificate/Artboard 3.svg",
    badge: "توكيد جودة معتمد",
  },
  {
    id: "sgs",
    code: "SGS",
    title: "شهادة فحص واعتماد SGS الدولية",
    englishTitle: "SGS Certified — Inspection & Verification",
    description:
      "اعتماد وتفتيش دوري مستقل من هيئة SGS السويسرية الرائدة عالمياً في فحص ومطابقة معايير التصنيع والجودة الصارمة.",
    logo: "/images/certificate/Artboard 5.svg",
    badge: "اعتماد وتفتيش SGS",
  },
  {
    id: "iso-14001",
    code: "ISO 14001",
    title: "نظام الإدارة البيئية",
    englishTitle: "Environmental Management System",
    description:
      "شهادة الالتزام بالمعايير البيئية العالمية، وضبط الأثر البيئي، وإعادة التدوير المسؤول لمكونات ومخلفات التصنيع.",
    logo: "/images/certificate/Artboard 7.svg",
    badge: "بيئي معتمد",
  },
  {
    id: "reach",
    code: "REACH",
    title: "سلامة المواد الكيميائية",
    englishTitle: "REACH Compliant",
    description:
      "مطابقة كاملة للائحة الاتحاد الأوروبي الخاصة بتسجيل وتقييم وتقييد المواد الكيميائية لضمان أمان صحي وبيئي مطلق.",
    logo: "/images/certificate/Artboard 1.svg",
    badge: "مطابقة أوروبية",
  },
  {
    id: "rohs",
    code: "RoHS",
    title: "تقييد وحظر المواد الخطرة",
    englishTitle: "RoHS Compliant",
    description:
      "خلو خراطيش ومساحيق الحبر تماماً من الرصاص والزئبق والكادميوم والمعادن الثقيلة السامة وفق التوجيهات الأوروبية.",
    logo: "/images/certificate/Artboard 6.svg",
    badge: "خالٍ من السموم",
  },
  {
    id: "stmc",
    code: "STMC",
    title: "معايير فحص واختبار الخراطيش",
    englishTitle: "STMC Compliant Company",
    description:
      "اعتماد لجنة طرق الاختبار الموحدة العالمية (STMC) لقياس الكثافة البصرية وتدرج السواد ومردود الصفحات الفعلي بدقة.",
    logo: "/images/certificate/Artboard 8.svg",
    badge: "معيار طابعات عالمي",
  },
  {
    id: "ce",
    code: "CE",
    title: "علامة المطابقة الأوروبية",
    englishTitle: "European Conformity (CE)",
    description:
      "إقرار رسمي بمطابقة كافة منتجات روايال إنك للمعايير الأوروبية المعتمدة لحماية الصحة والسلامة والبيئة.",
    logo: "/images/certificate/ce.svg",
    badge: "معتمد أوروبياً",
  },
  {
    id: "gmc",
    code: "GMC",
    title: "شهادة الصانع العالمي المعتمد",
    englishTitle: "Global Manufacturer Certificate",
    description:
      "شهادة دولية معتمدة تؤكد تميز المصنع في القدرة الإنتاجية المتطورة، ضبط الجودة، وموثوقية التوريد العالمية.",
    logo: "/images/certificate/Artboard 4.svg",
    badge: "صانع عالمي معتمد",
  },
  {
    id: "bureau-veritas",
    code: "Bureau Veritas",
    title: "اعتماد بيرو فيريتاس الدولي",
    englishTitle: "Bureau Veritas Certified (1828)",
    description:
      "مصادقة وتفتيش دوري مستقل من هيئة Bureau Veritas العالمية الرائدة في التحقق من الامتثال ومعايير الجودة الصناعية.",
    logo: "/images/certificate/Artboard 9.svg",
    badge: "تفتيش واعتماد دولي",
  },
  {
    id: "china-environmental-label",
    code: "Ten Rings",
    title: "العلامة البيئية الصينية (Ten Rings)",
    englishTitle: "China Environmental Labelling (Ten Rings)",
    description:
      "شهادة الاعتماد البيئي الرسمية الرائدة لمستلزمات الطباعة، تؤكد الامتثال لأعلى معايير التصنيع الأخضر وخلو المنتجات من الانبعاثات الضارة.",
    logo: "/images/certificate/Artboard 10.svg",
    badge: "اعتماد بيئي أخضر",
  },
];
