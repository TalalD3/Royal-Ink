"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Link2,
  MessageCircleQuestion,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Badge,
  Btn,
  Field,
  IconBtn,
  LoadingBlock,
  Notice,
  SectionHead,
  Toast,
  inputCls,
  textareaCls,
} from "@/components/admin/admin-ui";
import { ImageCropperModal } from "@/components/ui/image-cropper-modal";
import { SocialIcon } from "@/components/contact/social-icons";
import { uploadAdminImage } from "@/lib/uploadthing-client";
import {
  DEFAULT_SITE_SETTINGS,
  SOCIAL_PLATFORMS,
  type FaqItem,
  type SiteSettings,
  type SocialAccount,
} from "@/types/site-settings";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   SITE SETTINGS (admin) — everything visitors see that may change one
   day: phones, email, address, hours, map link, social accounts, the
   contact page photos, facts and FAQ, and the online store address.
   One save for the whole page; the site updates within moments.
   ══════════════════════════════════════════════════════════════════════ */

type ImageField = "contactHeroImage" | "storeImage";

const IMAGES: { field: ImageField; title: string; where: string; ratio: number; ratioLabel: string; aspect: string }[] = [
  {
    field: "contactHeroImage",
    title: "صورة واجهة صفحة التواصل",
    where: "تظهر بجانب العنوان في أعلى صفحة «اتصل بنا».",
    ratio: 6 / 5,
    ratioLabel: "6:5 (مثلاً 1440 × 1200)",
    aspect: "aspect-[6/5]",
  },
  {
    field: "storeImage",
    title: "صورة المتجر",
    where: "تظهر في قسم «زورونا» بصفحتي «اتصل بنا» و«نقاط البيع».",
    ratio: 1470 / 1070,
    ratioLabel: "11:8 (مثلاً 1470 × 1070)",
    aspect: "aspect-[1470/1070]",
  },
];

const SECTIONS = [
  { id: "set-contact", label: "التواصل والعنوان", icon: Phone },
  { id: "set-socials", label: "حسابات التواصل", icon: Link2 },
  { id: "set-images", label: "الصور", icon: ImageIcon },
  { id: "set-facts", label: "نقاط صفحة التواصل", icon: Sparkles },
  { id: "set-faq", label: "الأسئلة الشائعة", icon: MessageCircleQuestion },
  { id: "set-store", label: "المتجر الإلكتروني", icon: ShoppingBag },
];

/* A titled white block with an anchor */
function Block({
  id,
  title,
  description,
  actions,
  children,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="ri-strip scroll-mt-40 border border-brand-line bg-white pt-[3px]">
      <div className="flex flex-col gap-3 border-b border-brand-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-brand-black sm:text-lg">{title}</h3>
          {description && <p className="mt-1 text-xs leading-5 text-brand-gray sm:text-[13px]">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function AdminSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<SiteSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Image cropping / upload
  const [cropFor, setCropFor] = useState<ImageField | null>(null);
  const [cropSrc, setCropSrc] = useState("");
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const fileRefs = useRef<Record<ImageField, HTMLInputElement | null>>({ contactHeroImage: null, storeImage: null });

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "تعذّر تحميل الإعدادات");
        setSettings(json.data);
        setSaved(json.data);
      } catch (err) {
        setLoadError((err as Error).message);
      }
    })();
  }, []);

  const dirty = useMemo(
    () => !!settings && !!saved && JSON.stringify(settings) !== JSON.stringify(saved),
    [settings, saved]
  );

  // Warn before leaving the page with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  if (loadError) return <Notice tone="danger">{loadError}</Notice>;
  if (!settings) return <LoadingBlock label="جارٍ تحميل الإعدادات…" />;

  const update = (patch: Partial<SiteSettings>) => setSettings((s) => (s ? { ...s, ...patch } : s));
  const setListItem = <K extends "phones" | "contactFacts">(key: K, i: number, value: string) =>
    update({ [key]: settings[key].map((v, j) => (j === i ? value : v)) } as Partial<SiteSettings>);
  const removeListItem = <K extends "phones" | "contactFacts">(key: K, i: number) =>
    update({ [key]: settings[key].filter((_, j) => j !== i) } as Partial<SiteSettings>);
  const setSocial = (id: SocialAccount["id"], patch: Partial<SocialAccount>) =>
    update({ socials: settings.socials.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const setFaq = (i: number, patch: Partial<FaqItem>) =>
    update({ faq: settings.faq.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const moveFaq = (i: number, dir: -1 | 1) => {
    const next = [...settings.faq];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update({ faq: next });
  };

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "تعذّر حفظ الإعدادات");
      setSettings(json.data);
      setSaved(json.data);
      showToast("تم حفظ الإعدادات — تظهر في الموقع خلال لحظات");
    } catch (err) {
      setSaveError((err as Error).message);
      showToast("لم يتم الحفظ — راجع الرسالة أسفل الصفحة", "error");
    } finally {
      setSaving(false);
    }
  }

  function pickImage(field: ImageField, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropFor(field);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropped(blob: Blob) {
    const field = cropFor;
    if (!field) return;
    setUploading(field);
    try {
      const { url } = await uploadAdminImage(blob, `${field}-${Date.now()}.webp`);
      update({ [field]: { url } } as Partial<SiteSettings>);
      showToast("تم رفع الصورة — اضغط «حفظ التغييرات» لاعتمادها");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setUploading(null);
    }
  }

  const cropMeta = IMAGES.find((m) => m.field === cropFor);

  return (
    <div className="space-y-6 pb-24">
      {toast && <Toast message={toast.message} tone={toast.type} />}

      <SectionHead
        eyebrow="إعدادات الموقع"
        title="معلومات الشركة والتواصل"
        description="الأرقام والعناوين والحسابات والصور التي يراها الزوار. ما تعدّله هنا يتحدّث في كل صفحات الموقع: التذييل، صفحة «اتصل بنا»، «نقاط البيع» وغيرها."
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        {/* Section index (desktop) */}
        <nav aria-label="أقسام الإعدادات" className="hidden lg:block">
          <ul className="sticky top-40 border border-brand-line bg-white">
            {SECTIONS.map((s) => (
              <li key={s.id} className="border-b border-brand-line last:border-b-0">
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-brand-black transition-colors hover:bg-brand-mist hover:text-brand-red"
                >
                  <s.icon className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {/* ── 1. Contact & address ── */}
          <Block
            id="set-contact"
            title="التواصل والعنوان"
            description="تظهر في التذييل، وصفحة «اتصل بنا»، وقسم «زورونا»، وبطاقات التواصل أسفل الصفحات."
          >
            <Field
              label="أرقام الهاتف"
              required
              hint="الرقم الأول هو الرئيسي: يُستعمل لزر «اتصل الآن» وزر الاتصال بالمقر في خريطة نقاط البيع."
            >
              <div className="space-y-2">
                {settings.phones.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand-mist text-xs font-extrabold text-brand-gray">
                      {i === 0 ? "رئيسي" : i + 1}
                    </span>
                    <input
                      dir="ltr"
                      value={p}
                      onChange={(e) => setListItem("phones", i, e.target.value)}
                      placeholder="+213 666 50 99 41"
                      aria-label={`رقم الهاتف ${i + 1}`}
                      className={cn(inputCls, "text-right font-bold tabular-nums")}
                    />
                    <IconBtn
                      label="حذف الرقم"
                      tone="danger"
                      className="h-11 w-11"
                      disabled={settings.phones.length <= 1}
                      onClick={() => removeListItem("phones", i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                ))}
                {settings.phones.length < 4 && (
                  <Btn
                    size="sm"
                    variant="outline"
                    icon={<Plus className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => update({ phones: [...settings.phones, ""] })}
                  >
                    إضافة رقم
                  </Btn>
                )}
              </div>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="البريد الإلكتروني" required htmlFor="set-email">
                <input
                  id="set-email"
                  type="email"
                  dir="ltr"
                  value={settings.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={cn(inputCls, "text-right")}
                />
              </Field>
              <Field
                label="رابط الموقع على خرائط Google"
                htmlFor="set-maps"
                hint="لزر «الاتجاهات على الخريطة». افتح المتجر في خرائط Google ← مشاركة ← نسخ الرابط."
              >
                <input
                  id="set-maps"
                  dir="ltr"
                  value={settings.mapsUrl}
                  onChange={(e) => update({ mapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/…"
                  className={cn(inputCls, "text-left")}
                />
              </Field>
            </div>

            <Field
              label="بريد استلام رسائل النموذج"
              required
              htmlFor="set-form-recipient"
              hint="لا يظهر للزوار — تصل إليه رسائل نموذج «اتصل بنا»، والضغط على «رد» يجيب العميل مباشرة."
            >
              <input
                id="set-form-recipient"
                type="email"
                dir="ltr"
                value={settings.formRecipient}
                onChange={(e) => update({ formRecipient: e.target.value })}
                className={cn(inputCls, "text-right md:max-w-md")}
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="العنوان" required htmlFor="set-address" hint="يمكنك تقسيمه على سطرين بزر Enter.">
                <textarea
                  id="set-address"
                  rows={2}
                  value={settings.address}
                  onChange={(e) => update({ address: e.target.value })}
                  className={textareaCls}
                />
              </Field>
              <Field
                label="أوقات العمل"
                htmlFor="set-hours"
                hint="اختياري — يظهر في قسم «زورونا» عند كتابته."
              >
                <textarea
                  id="set-hours"
                  rows={2}
                  value={settings.hours}
                  onChange={(e) => update({ hours: e.target.value })}
                  placeholder={"السبت – الخميس: 8:00 – 17:00\nالجمعة: مغلق"}
                  className={textareaCls}
                />
              </Field>
            </div>
          </Block>

          {/* ── 2. Social accounts ── */}
          <Block
            id="set-socials"
            title="حسابات التواصل الاجتماعي"
            description="يظهر الحساب في التذييل وصفحة «اتصل بنا» عندما يكون مفعّلاً وله رابط. جهّز الحسابات الجديدة هنا وفعّلها متى أردت."
          >
            <ul className="divide-y divide-brand-line border border-brand-line">
              {SOCIAL_PLATFORMS.map((p) => {
                const a = settings.socials.find((s) => s.id === p.id)!;
                const shown = a.enabled && !!a.url;
                return (
                  <li key={p.id} className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center transition-colors",
                          shown ? "bg-brand-black text-white" : "bg-brand-mist text-brand-gray"
                        )}
                      >
                        <SocialIcon id={p.id} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-brand-black">{p.name}</span>
                        <span className="mt-1 block">
                          {shown ? (
                            <Badge tone="success">يظهر في الموقع</Badge>
                          ) : a.enabled ? (
                            <Badge tone="red">ينقصه الرابط</Badge>
                          ) : (
                            <Badge tone="outline">مخفي</Badge>
                          )}
                        </span>
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={a.enabled}
                        aria-label={`إظهار ${p.name}`}
                        onClick={() => setSocial(p.id, { enabled: !a.enabled })}
                        className={cn("relative h-6 w-11 shrink-0 transition-colors", a.enabled ? "bg-brand-red" : "bg-brand-line")}
                      >
                        <span
                          className={cn(
                            "absolute top-1 h-4 w-4 bg-white transition-[inset-inline-start]",
                            a.enabled ? "start-6" : "start-1"
                          )}
                        />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                      <input
                        dir="ltr"
                        value={a.handle}
                        onChange={(e) => setSocial(p.id, { handle: e.target.value })}
                        placeholder={p.handleExample}
                        aria-label={`اسم الحساب على ${p.name}`}
                        className={cn(inputCls, "text-right")}
                      />
                      <input
                        dir="ltr"
                        value={a.url}
                        onChange={(e) => setSocial(p.id, { url: e.target.value })}
                        placeholder={p.urlExample}
                        aria-label={`رابط ${p.name}`}
                        className={cn(inputCls, "text-left")}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Block>

          {/* ── 3. Photos ── */}
          <Block
            id="set-images"
            title="الصور"
            description="ارفع الصورة واضبط إطارها. تُعتمد بعد الضغط على «حفظ التغييرات»."
          >
            <div className="grid gap-5 md:grid-cols-2">
              {IMAGES.map((m) => {
                const img = settings[m.field];
                const isDefault = img.url === DEFAULT_SITE_SETTINGS[m.field].url;
                return (
                  <div key={m.field} className="border border-brand-line">
                    <div className={cn("relative overflow-hidden bg-brand-mist", m.aspect)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      {uploading === m.field && (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-black/60 text-sm font-bold text-white">
                          جارٍ الرفع…
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="text-sm font-extrabold text-brand-black">{m.title}</p>
                        <p className="mt-1 text-xs leading-5 text-brand-gray">{m.where}</p>
                        <p className="mt-1 text-xs text-brand-gray">
                          النسبة: <span dir="ltr">{m.ratioLabel}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Btn
                          size="sm"
                          variant="black"
                          icon={<Upload className="h-4 w-4" aria-hidden="true" />}
                          disabled={!!uploading}
                          onClick={() => fileRefs.current[m.field]?.click()}
                        >
                          تغيير الصورة
                        </Btn>
                        {!isDefault && (
                          <Btn
                            size="sm"
                            variant="ghost"
                            icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
                            onClick={() => update({ [m.field]: { url: DEFAULT_SITE_SETTINGS[m.field].url } } as Partial<SiteSettings>)}
                          >
                            الصورة الأصلية
                          </Btn>
                        )}
                        <input
                          ref={(el) => {
                            fileRefs.current[m.field] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => pickImage(m.field, e)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>

          {/* ── 4. Contact page facts ── */}
          <Block
            id="set-facts"
            title="نقاط صفحة التواصل"
            description="جمل قصيرة تظهر تحت العنوان في أعلى صفحة «اتصل بنا» (حتى أربع)."
          >
            <div className="space-y-2">
              {settings.contactFacts.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand-mist" aria-hidden="true">
                    <span className="h-2 w-2 bg-brand-red" />
                  </span>
                  <input
                    value={f}
                    onChange={(e) => setListItem("contactFacts", i, e.target.value)}
                    aria-label={`النقطة ${i + 1}`}
                    className={inputCls}
                  />
                  <IconBtn label="حذف النقطة" tone="danger" className="h-11 w-11" onClick={() => removeListItem("contactFacts", i)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              ))}
              {settings.contactFacts.length < 4 && (
                <Btn
                  size="sm"
                  variant="outline"
                  icon={<Plus className="h-4 w-4" aria-hidden="true" />}
                  onClick={() => update({ contactFacts: [...settings.contactFacts, ""] })}
                >
                  إضافة نقطة
                </Btn>
              )}
            </div>
          </Block>

          {/* ── 5. FAQ ── */}
          <Block
            id="set-faq"
            title="الأسئلة الشائعة"
            description={
              <>
                تظهر في أسفل صفحة «اتصل بنا» بهذا الترتيب. لإضافة رابط داخل الجواب اكتب{" "}
                <span dir="ltr" className="bg-brand-mist px-1.5 py-0.5 font-bold text-brand-black">
                  [دليل التوافق](/compatibility)
                </span>
                .
              </>
            }
            actions={
              <Btn
                size="sm"
                variant="red"
                icon={<Plus className="h-4 w-4" aria-hidden="true" />}
                disabled={settings.faq.length >= 20}
                onClick={() => update({ faq: [...settings.faq, { q: "", a: "" }] })}
              >
                إضافة سؤال
              </Btn>
            }
          >
            {settings.faq.length === 0 ? (
              <p className="border border-dashed border-brand-line px-4 py-6 text-center text-sm text-brand-gray">
                لا توجد أسئلة — لن يظهر قسم الأسئلة الشائعة حتى تضيف سؤالاً.
              </p>
            ) : (
              <ol className="space-y-4">
                {settings.faq.map((f, i) => (
                  <li key={i} className="border border-brand-line">
                    <div className="flex items-center justify-between gap-3 border-b border-brand-line bg-brand-mist px-3 py-2">
                      <span className="text-[13px] font-extrabold text-brand-black">السؤال {String(i + 1).padStart(2, "0")}</span>
                      <span className="flex gap-1.5">
                        <IconBtn label="تقديم السؤال" className="h-9 w-9" disabled={i === 0} onClick={() => moveFaq(i, -1)}>
                          <ChevronUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          label="تأخير السؤال"
                          className="h-9 w-9"
                          disabled={i === settings.faq.length - 1}
                          onClick={() => moveFaq(i, 1)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          label="حذف السؤال"
                          tone="danger"
                          className="h-9 w-9"
                          onClick={() => update({ faq: settings.faq.filter((_, j) => j !== i) })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </span>
                    </div>
                    <div className="space-y-3 p-3 sm:p-4">
                      <input
                        value={f.q}
                        onChange={(e) => setFaq(i, { q: e.target.value })}
                        placeholder="السؤال"
                        aria-label={`السؤال ${i + 1}`}
                        className={cn(inputCls, "font-bold")}
                      />
                      <textarea
                        rows={3}
                        value={f.a}
                        onChange={(e) => setFaq(i, { a: e.target.value })}
                        placeholder="الجواب"
                        aria-label={`جواب السؤال ${i + 1}`}
                        className={textareaCls}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Block>

          {/* ── 6. Online store ── */}
          <Block
            id="set-store"
            title="المتجر الإلكتروني"
            description="ما دام الحقل فارغاً تظهر أزرار «تسوق من متجرنا» في صفحات المنتجات بعبارة «قريباً». ضع رابط المتجر عند افتتاحه فتعمل كلها مباشرة."
          >
            <Field label="رابط المتجر" htmlFor="set-store-url">
              <input
                id="set-store-url"
                dir="ltr"
                value={settings.onlineStoreUrl}
                onChange={(e) => update({ onlineStoreUrl: e.target.value })}
                placeholder="https://shop.royalink.dz"
                className={cn(inputCls, "text-left")}
              />
            </Field>
            {settings.onlineStoreUrl ? (
              <Notice tone="success">أزرار «تسوق من متجرنا» تفتح هذا الرابط مع كود المنتج.</Notice>
            ) : (
              <Notice tone="info">المتجر غير مفعّل — تظهر الأزرار بعبارة «قريباً».</Notice>
            )}
          </Block>

          {saveError && <Notice tone="danger">{saveError}</Notice>}
        </div>
      </div>

      {/* ── Save bar ── */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-brand-line bg-white/95 backdrop-blur transition-[transform,visibility] duration-300",
          dirty ? "visible translate-y-0" : "invisible translate-y-full"
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-black">
            <span className="h-2 w-2 shrink-0 bg-brand-red" aria-hidden="true" />
            <span className="hidden sm:inline">لديك تغييرات غير محفوظة</span>
            <span className="sm:hidden">تغييرات غير محفوظة</span>
          </p>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => saved && setSettings(saved)} disabled={saving}>
              تراجع
            </Btn>
            <Btn variant="red" loading={saving} icon={<Save className="h-4 w-4" aria-hidden="true" />} onClick={handleSave}>
              حفظ التغييرات
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Cropper ── */}
      {cropFor && cropMeta && (
        <ImageCropperModal
          isOpen
          imageSrc={cropSrc}
          onClose={() => setCropFor(null)}
          onCropComplete={handleCropped}
          aspectRatio={cropMeta.ratio}
          title={`قص ${cropMeta.title}`}
          subtitle="اضبط موضع الصورة داخل الإطار."
          recommendedSizeText={cropMeta.ratioLabel}
        />
      )}
    </div>
  );
}

export default AdminSettingsManager;
