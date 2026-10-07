"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { DbDistributor } from "@/types/distributor";
import { algeriaWilayas } from "@/data/algeria-wilayas";
import { badgeConfig, type BadgeTier } from "@/data/distributors";
import {
  exportDistributorsToExcel,
  downloadDistributorsTemplate,
  parseDistributorsExcel,
  type NewDistributorPayload,
} from "@/lib/excel/distributors-excel";
import {
  Badge,
  Btn,
  EmptyState,
  Field,
  FormSection,
  IconBtn,
  LoadingBlock,
  Modal,
  Notice,
  Panel,
  SectionHead,
  Select,
  StatStrip,
  inputCls,
  textareaCls,
} from "@/components/admin/admin-ui";
import {
  MapPin,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Phone,
  Building2,
  Loader2,
  X,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  Upload,
  FileDown,
  FileSpreadsheet,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** The rank as a square tag: the headquarters in red, partners in black */
const BADGE_TONE: Record<BadgeTier, "red" | "black" | "mist" | "outline"> = {
  headquarters: "red",
  premium: "black",
  authorized: "mist",
  standard: "outline",
};

function RankBadge({ tier }: { tier: string }) {
  const t = (tier in BADGE_TONE ? tier : "standard") as BadgeTier;
  return <Badge tone={BADGE_TONE[t]}>{badgeConfig[t].labelAr}</Badge>;
}

export function AdminDistributorsManager() {
  const [distributors, setDistributors] = useState<DbDistributor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState<number | "all">("all");
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DbDistributor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formWilaya, setFormWilaya] = useState<number>(19); // Default to Setif
  const [formBadge, setFormBadge] = useState<BadgeTier>("authorized");
  const [formLocationUrl, setFormLocationUrl] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Excel Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    distributors: NewDistributorPayload[];
    total: number;
    errors: string[];
  } | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Clear confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch all distributors
  const fetchDistributors = async () => {
    setLoading(true);
    try {

      const res = await fetch("/api/admin/distributors", {
      });
      const json = await res.json();
      if (json.data) {
        setDistributors(json.data as DbDistributor[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  // Open modal for Create or Edit
  const openCreateModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormWilaya(19);
    setFormBadge("authorized");
    setFormLocationUrl("");
    setFormPhone("");
    setFormAddress("");
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: DbDistributor) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormWilaya(item.wilaya_code);
    setFormBadge(item.badge as BadgeTier);
    setFormLocationUrl(item.location_url || "");
    setFormPhone(item.phone || "");
    setFormAddress(item.address || "");
    setModalError("");
    setIsModalOpen(true);
  };

  // Handle Save (Insert or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("يرجى إدخال اسم نقطة البيع أو العميل.");
      return;
    }

    if (!formPhone.trim()) {
      setModalError("يرجى إدخال رقم الهاتف.");
      return;
    }

    setSubmitting(true);
    setModalError("");

    // Validate phone format
    let cleanedPhone: string | null = null;
    {
      const raw = formPhone.trim().replace(/[\s\-().]/g, "");
      // Accept: 0XXXXXXXXX (10 digits) or +213XXXXXXXXX (13 chars) or 213XXXXXXXXX (12 digits)
      const localMatch = raw.match(/^0(\d{9})$/);
      const intlMatch = raw.match(/^\+?213(\d{9})$/);
      if (localMatch) {
        cleanedPhone = `+213${localMatch[1]}`;
      } else if (intlMatch) {
        cleanedPhone = `+213${intlMatch[1]}`;
      } else {
        setModalError("رقم الهاتف غير صحيح. يجب أن يكون بصيغة 0XXXXXXXXX أو +213XXXXXXXXX (مثال: 0549130573)");
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      name: formName.trim(),
      wilaya_code: Number(formWilaya),
      badge: formBadge,
      location_url: formLocationUrl.trim() || null,
      phone: cleanedPhone,
      address: formAddress.trim() || null,
      is_active: true,
    };

    try {

      if (editingItem) {
        const res = await fetch("/api/admin/distributors", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: editingItem.id, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "فشل التعديل");
      } else {
        const res = await fetch("/api/admin/distributors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "فشل الإضافة");
      }

      setIsModalOpen(false);
      fetchDistributors();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete item
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف نقطة البيع "${name}"؟`)) return;

    try {

      const res = await fetch(`/api/admin/distributors?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDistributors((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert("حدث خطأ أثناء الحذف.");
      }
    } catch {
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {

      const res = await fetch("/api/admin/distributors", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      if (res.ok) {
        setDistributors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, is_active: !currentStatus } : d))
        );
      }
    } catch {
      alert("تعذر تحديث الحالة.");
    }
  };

  // Seed sample initial points if table is empty
  const handleSeedDefaults = async () => {
    if (
      !confirm(
        "سيتم إضافة نقاط بيع نموذجية أولية (سطيف المقر الرئيسي، الجزائر العاصمة، وهران، قسنطينة). هل تريد المتابعة؟"
      )
    )
      return;

    const initialData = [
      {
        name: "Royal Ink — المقر الرئيسي",
        wilaya_code: 19,
        badge: "headquarters",
        location_url: "https://maps.google.com",
        phone: "+213 666 50 99 41",
        address: "دبي، مدينة العلمة 19001 — سطيف",
        is_active: true,
      },
      {
        name: "نقطة بيع الجزائر العاصمة",
        wilaya_code: 16,
        badge: "premium",
        location_url: "https://maps.google.com",
        phone: "+213 550 00 00 01",
        address: "الجزائر العاصمة — متوفر جميع مستلزمات روايال إنك",
        is_active: true,
      },
      {
        name: "نقطة بيع وهران",
        wilaya_code: 31,
        badge: "authorized",
        location_url: "https://maps.google.com",
        phone: "+213 550 00 00 02",
        address: "وهران — موزع معتمد",
        is_active: true,
      },
      {
        name: "نقطة بيع قسنطينة",
        wilaya_code: 25,
        badge: "authorized",
        location_url: "https://maps.google.com",
        phone: "+213 550 00 00 03",
        address: "قسنطينة — موزع معتمد",
        is_active: true,
      },
    ];

    try {

      setLoading(true);
      const res = await fetch("/api/admin/distributors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initialData),
      });
      if (res.ok) {
        fetchDistributors();
      }
    } catch {
      alert("فشلت عملية البذر.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel file selection for Import
  const handleSelectExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const result = await parseDistributorsExcel(file);
      setImportPreview(result);
    } catch (err) {
      alert("تعذر قراءة ملف الـ Excel. يرجى التأكد من صحة التنسيق.");
    } finally {
      setImporting(false);
      if (importFileInputRef.current) importFileInputRef.current.value = "";
    }
  };

  // Confirm Excel Import
  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.distributors.length === 0) return;

    setImporting(true);
    try {

      const res = await fetch("/api/admin/distributors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(importPreview.distributors),
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        setImportPreview(null);
        fetchDistributors();
        alert(`تم بنجاح استيراد ${importPreview.distributors.length} نقطة بيع!`);
      } else {
        const json = await res.json().catch(() => null);
        alert(json?.error || "حدث خطأ أثناء استيراد نقاط البيع.");
      }
    } catch {
      alert("حدث خطأ أثناء الاستيراد.");
    } finally {
      setImporting(false);
    }
  };

  // Delete all distributors
  const handleDeleteAllDistributors = async () => {
    if (distributors.length === 0) return;

    try {

      const res = await fetch("/api/admin/distributors?id=all", {
        method: "DELETE",
      });

      if (res.ok) {
        setDistributors([]);
        setShowClearConfirm(false);
      }
    } catch {
      alert("حدث خطأ أثناء إفراغ نقاط البيع.");
    }
  };

  // Sorted Wilayas list for dropdown
  const sortedWilayas = useMemo(() => {
    return [...algeriaWilayas].sort((a, b) => a.code - b.code);
  }, []);

  // Map of Wilaya Code -> Wilaya Name
  const wilayaNamesMap = useMemo(() => {
    const map = new Map<number, string>();
    algeriaWilayas.forEach((w) => map.set(w.code, `${w.code} - ${w.nameAr} (${w.nameFr})`));
    return map;
  }, []);

  // Filtered distributors
  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      if (selectedWilayaFilter !== "all" && d.wilaya_code !== selectedWilayaFilter) return false;
      if (selectedBadgeFilter !== "all" && d.badge !== selectedBadgeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesPhone = (d.phone || "").toLowerCase().includes(q);
        const matchesAddress = (d.address || "").toLowerCase().includes(q);
        const wilayaName = wilayaNamesMap.get(d.wilaya_code) || "";
        const matchesWilaya = wilayaName.toLowerCase().includes(q);

        return matchesName || matchesPhone || matchesAddress || matchesWilaya;
      }
      return true;
    });
  }, [distributors, selectedWilayaFilter, selectedBadgeFilter, searchQuery, wilayaNamesMap]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = distributors.length;
    const activeCount = distributors.filter((d) => d.is_active).length;
    const uniqueWilayas = new Set(distributors.filter((d) => d.is_active).map((d) => d.wilaya_code));
    const wilayasCovered = uniqueWilayas.size;
    const coveragePercentage = Math.round((wilayasCovered / 58) * 100);

    return { total, activeCount, wilayasCovered, coveragePercentage };
  }, [distributors]);

  const hasFilters =
    searchQuery.trim() !== "" || selectedWilayaFilter !== "all" || selectedBadgeFilter !== "all";
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedWilayaFilter("all");
    setSelectedBadgeFilter("all");
  };
  const openImport = () => {
    setImportPreview(null);
    setIsImportModalOpen(true);
  };
  const wilayaName = (code: number) =>
    algeriaWilayas.find((w) => w.code === code)?.nameAr || `ولاية ${code}`;

  return (
    <div className="space-y-6">
      <SectionHead
        eyebrow="أين تجدنا"
        title="نقاط البيع"
        description="نقاط البيع التي تظهر على خريطة الموزعين، مع أرقامها ومواقعها."
        actions={
          <Btn variant="red" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateModal}>
            إضافة نقطة بيع
          </Btn>
        }
      />

      {/* ─── Figures ─── */}
      <StatStrip
        items={[
          { label: "إجمالي نقاط البيع", value: stats.total, icon: <Building2 className="h-5 w-5" aria-hidden="true" /> },
          { label: "النقاط الظاهرة", value: stats.activeCount, icon: <Eye className="h-5 w-5" aria-hidden="true" /> },
          {
            label: "ولايات مغطاة من 58",
            value: stats.wilayasCovered,
            icon: <MapPin className="h-5 w-5" aria-hidden="true" />,
          },
          {
            label: "نسبة التغطية الوطنية",
            value: `${stats.coveragePercentage}%`,
            icon: <Percent className="h-5 w-5" aria-hidden="true" />,
          },
        ]}
      />

      {/* ─── Search, filters and Excel ─── */}
      <Panel>
        <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_240px_200px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الولاية أو الهاتف…"
              aria-label="بحث في نقاط البيع"
              className={cn(inputCls, "ps-10 pe-10")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="مسح البحث"
                className="absolute end-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-brand-gray hover:text-brand-black"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:contents">
            <Select
              value={selectedWilayaFilter}
              onChange={(e) => setSelectedWilayaFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              aria-label="الولاية"
            >
              <option value="all">كل الولايات</option>
              {sortedWilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </Select>
            <Select value={selectedBadgeFilter} onChange={(e) => setSelectedBadgeFilter(e.target.value)} aria-label="الرتبة">
              <option value="all">كل الرتب</option>
              <option value="headquarters">المقر</option>
              <option value="premium">شريك رئيسي</option>
              <option value="authorized">موزع معتمد</option>
              <option value="standard">نقطة بيع</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-brand-line bg-brand-mist px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Btn
              size="sm"
              variant="outline"
              title="تحميل ملف Excel فارغ بالأعمدة الصحيحة"
              icon={<FileDown className="h-4 w-4" aria-hidden="true" />}
              onClick={downloadDistributorsTemplate}
            >
              النموذج
            </Btn>
            <Btn
              size="sm"
              variant="outline"
              title="تصدير كل نقاط البيع إلى Excel"
              icon={<Download className="h-4 w-4" aria-hidden="true" />}
              onClick={() => exportDistributorsToExcel(distributors)}
            >
              تصدير
            </Btn>
            <Btn size="sm" variant="outline" icon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={openImport}>
              استيراد
            </Btn>
          </div>

          {/* Clear all — asks once more, inline */}
          {distributors.length > 0 &&
            (!showClearConfirm ? (
              <Btn
                size="sm"
                variant="ghost"
                className="text-brand-red hover:bg-white hover:text-brand-red"
                icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setShowClearConfirm(true)}
              >
                إفراغ نقاط البيع
              </Btn>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-brand-red/30 bg-white px-3 py-2">
                <span className="flex items-center gap-2 text-[13px] font-bold text-brand-black">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                  حذف كل نقاط البيع ({distributors.length})؟
                </span>
                <span className="flex gap-2 ms-auto">
                  <Btn size="sm" variant="red" onClick={handleDeleteAllDistributors}>
                    تأكيد الحذف
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)}>
                    إلغاء
                  </Btn>
                </span>
              </div>
            ))}
        </div>
      </Panel>

      {/* ─── Count ─── */}
      {!loading && distributors.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-gray">
          <p>
            عرض <span className="font-extrabold text-brand-black">{filteredDistributors.length}</span> من{" "}
            <span className="font-extrabold text-brand-black">{distributors.length}</span> نقطة بيع
          </p>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="text-sm font-bold text-brand-red underline-offset-4 hover:underline">
              مسح الفلاتر
            </button>
          )}
        </div>
      )}

      {/* ─── Points of sale ─── */}
      {loading ? (
        <LoadingBlock label="جارٍ تحميل نقاط البيع…" />
      ) : filteredDistributors.length === 0 ? (
        distributors.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-6 w-6" aria-hidden="true" />}
            title="لا توجد نقاط بيع بعد"
            text="أضف أول نقطة بيع، أو استورد القائمة من Excel، أو ابدأ ببيانات نموذجية تعدّلها لاحقاً."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Btn variant="red" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={openCreateModal}>
                  إضافة نقطة بيع
                </Btn>
                <Btn variant="outline" icon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={openImport}>
                  استيراد من Excel
                </Btn>
                <Btn variant="ghost" icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} onClick={handleSeedDefaults}>
                  بيانات نموذجية
                </Btn>
              </div>
            }
          />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" aria-hidden="true" />}
            title="لا توجد نقاط بيع مطابقة"
            text="جرّب كلمة بحث أخرى، أو امسح الفلاتر لعرض كل النقاط."
            action={
              <Btn variant="outline" onClick={resetFilters}>
                مسح الفلاتر
              </Btn>
            }
          />
        )
      ) : (
        <>
          {/* Desktop: a ruled table */}
          <div className="hidden overflow-x-auto border border-brand-line bg-white lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-black text-white">
                  <th className="px-4 py-3 text-start text-xs font-extrabold">نقطة البيع</th>
                  <th className="w-44 px-4 py-3 text-start text-xs font-extrabold">الولاية</th>
                  <th className="w-36 px-4 py-3 text-start text-xs font-extrabold">الرتبة</th>
                  <th className="w-44 px-4 py-3 text-start text-xs font-extrabold">الهاتف</th>
                  <th className="w-28 px-4 py-3 text-start text-xs font-extrabold">الخريطة</th>
                  <th className="w-28 px-4 py-3 text-center text-xs font-extrabold">الحالة</th>
                  <th className="w-32 px-4 py-3 text-center text-xs font-extrabold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistributors.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-t border-brand-line align-middle transition-colors hover:bg-brand-mist/60",
                      !item.is_active && "bg-brand-mist/40 text-brand-gray"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className={cn("font-extrabold leading-6", item.is_active ? "text-brand-black" : "text-brand-gray")}>
                        {item.name}
                      </p>
                      {item.address && (
                        <p className="mt-0.5 line-clamp-1 max-w-[340px] text-xs leading-5 text-brand-gray">{item.address}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="bg-brand-black px-1.5 py-1 text-[11px] font-extrabold leading-none tabular-nums text-white">
                          {pad(item.wilaya_code)}
                        </span>
                        <span className="font-bold text-brand-black">{wilayaName(item.wilaya_code)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RankBadge tier={item.badge} />
                    </td>
                    <td className="px-4 py-3">
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone.replace(/\s/g, "")}`}
                          dir="ltr"
                          className="inline-flex items-center gap-2 font-bold text-brand-black transition-colors hover:text-brand-red"
                        >
                          <Phone className="h-3.5 w-3.5 text-brand-gray" aria-hidden="true" />
                          {item.phone}
                        </a>
                      ) : (
                        <span className="text-brand-gray/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.location_url ? (
                        <a
                          href={item.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-red hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          فتح
                        </a>
                      ) : (
                        <span className="text-brand-gray/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        title={item.is_active ? "إخفاء من الخريطة" : "إظهار على الخريطة"}
                        className="inline-flex"
                      >
                        <Badge tone={item.is_active ? "success" : "outline"}>{item.is_active ? "ظاهرة" : "مخفية"}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <IconBtn label="تعديل" onClick={() => openEditModal(item)}>
                          <Edit2 className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="حذف" tone="danger" onClick={() => handleDelete(item.id, item.name)}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones and tablets: one card per point of sale */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:hidden">
            {filteredDistributors.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "flex flex-col border bg-white",
                  item.is_active ? "border-brand-line" : "border-dashed border-brand-gray/40"
                )}
              >
                <div className="flex flex-1 items-start gap-3 p-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 flex-col items-center justify-center",
                      item.is_active ? "bg-brand-black text-white" : "bg-brand-mist text-brand-gray"
                    )}
                  >
                    <span className="text-[9px] font-bold leading-none opacity-60">ولاية</span>
                    <span className="mt-1 text-base font-extrabold leading-none tabular-nums">{pad(item.wilaya_code)}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RankBadge tier={item.badge} />
                      {!item.is_active && <Badge tone="outline">مخفية</Badge>}
                    </div>
                    <h3 className="mt-2 text-base font-extrabold leading-7 text-brand-black">{item.name}</h3>
                    <p className="mt-0.5 text-sm leading-6 text-brand-gray">
                      {wilayaName(item.wilaya_code)}
                      {item.address ? ` — ${item.address}` : ""}
                    </p>
                  </div>
                </div>

                {(item.phone || item.location_url) && (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-brand-line px-4 py-3">
                    {item.phone ? (
                      <a
                        href={`tel:${item.phone.replace(/\s/g, "")}`}
                        dir="ltr"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-black"
                      >
                        <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
                        {item.phone}
                      </a>
                    ) : (
                      <span />
                    )}
                    {item.location_url && (
                      <a
                        href={item.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-red"
                      >
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        الخريطة
                      </a>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 border-t border-brand-line">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    className="flex h-11 items-center justify-center gap-2 text-[13px] font-bold text-brand-black transition-colors hover:bg-brand-mist"
                  >
                    {item.is_active ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    {item.is_active ? "إخفاء" : "إظهار"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="flex h-11 items-center justify-center gap-2 bg-brand-black text-[13px] font-bold text-white transition-colors hover:bg-brand-red"
                  >
                    <Edit2 className="h-4 w-4" aria-hidden="true" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="flex h-11 items-center justify-center gap-2 text-[13px] font-bold text-brand-red transition-colors hover:bg-brand-red hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* ─── CREATE / EDIT ─── */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eyebrow={editingItem ? "تعديل نقطة بيع" : "نقطة بيع جديدة"}
        title={editingItem ? "تعديل نقطة البيع" : "إضافة نقطة بيع جديدة"}
        description="الحقول المعلّمة بـ * مطلوبة."
        footer={
          <>
            <Btn variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Btn>
            <Btn
              type="submit"
              form="admin-distributor-form"
              variant="red"
              loading={submitting}
              icon={<Check className="h-4 w-4" aria-hidden="true" />}
            >
              {submitting ? "جارٍ الحفظ…" : editingItem ? "حفظ التعديلات" : "إضافة نقطة البيع"}
            </Btn>
          </>
        }
      >
        <form id="admin-distributor-form" onSubmit={handleSave} className="space-y-6">
          {modalError && <Notice tone="danger">{modalError}</Notice>}

          <FormSection title="التعريف">
            <Field label="الاسم" required htmlFor="dist-name">
              <input
                id="dist-name"
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: مكتبة النور — موزع معتمد"
                className={inputCls}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الولاية" htmlFor="dist-wilaya">
                <Select id="dist-wilaya" value={formWilaya} onChange={(e) => setFormWilaya(Number(e.target.value))}>
                  {sortedWilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.nameAr}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="الرتبة" htmlFor="dist-badge">
                <Select id="dist-badge" value={formBadge} onChange={(e) => setFormBadge(e.target.value as BadgeTier)}>
                  <option value="authorized">موزع معتمد</option>
                  <option value="premium">شريك رئيسي</option>
                  <option value="standard">نقطة بيع</option>
                  <option value="headquarters">المقر الرئيسي</option>
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="التواصل والموقع">
            <Field label="الهاتف" required htmlFor="dist-phone" hint="بصيغة 0XXXXXXXXX أو ‎+213XXXXXXXXX.">
              <input
                id="dist-phone"
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+213 550 00 00 00"
                dir="ltr"
                className={cn(inputCls, "text-left")}
              />
            </Field>
            <Field label="رابط الخريطة" hint="اختياري — رابط الموقع من خرائط Google." htmlFor="dist-map">
              <input
                id="dist-map"
                type="url"
                value={formLocationUrl}
                onChange={(e) => setFormLocationUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                dir="ltr"
                className={cn(inputCls, "text-left")}
              />
            </Field>
            <Field label="العنوان" htmlFor="dist-address">
              <textarea
                id="dist-address"
                rows={2}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="شارع الاستقلال، بجانب البريد…"
                className={textareaCls}
              />
            </Field>
          </FormSection>
        </form>
      </Modal>

      {/* ─── EXCEL IMPORT ─── */}
      <Modal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        size="sm"
        eyebrow="Excel"
        title="استيراد نقاط البيع"
        description="ملف ‎.xlsx أو ‎.xls بنفس أعمدة النموذج."
        footer={
          importPreview ? (
            <>
              <Btn variant="outline" onClick={() => setImportPreview(null)}>
                إلغاء
              </Btn>
              <Btn
                variant="red"
                loading={importing}
                disabled={importPreview.total === 0}
                icon={<Upload className="h-4 w-4" aria-hidden="true" />}
                onClick={handleConfirmImport}
              >
                تأكيد واستيراد ({importPreview.total})
              </Btn>
            </>
          ) : (
            <Btn
              variant="outline"
              icon={<FileDown className="h-4 w-4" aria-hidden="true" />}
              onClick={downloadDistributorsTemplate}
            >
              تحميل النموذج
            </Btn>
          )
        }
      >
        <div className="space-y-4">
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleSelectExcelFile}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => importFileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 border border-dashed border-brand-black/30 bg-brand-mist px-6 py-8 text-center transition-colors hover:border-brand-red"
          >
            <span className="flex h-12 w-12 items-center justify-center bg-brand-black text-white">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-extrabold text-brand-black">اختر ملف Excel لنقاط البيع</span>
            <span className="text-xs leading-5 text-brand-gray">استخدم النموذج لتتأكد من ترتيب الأعمدة.</span>
          </button>

          {importing && !importPreview && (
            <p className="flex items-center justify-center gap-2 text-sm font-bold text-brand-gray">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              جارٍ قراءة الملف…
            </p>
          )}

          {importPreview && (
            <>
              <Notice tone="success">
                تم استخراج {importPreview.total} نقطة بيع، وهي جاهزة للحفظ.
              </Notice>
              {importPreview.errors.length > 0 && (
                <Notice tone="danger">
                  <ul className="max-h-32 space-y-1 overflow-y-auto">
                    {importPreview.errors.slice(0, 4).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  {importPreview.errors.length > 4 && (
                    <p className="mt-1 text-xs">و{importPreview.errors.length - 4} ملاحظات أخرى.</p>
                  )}
                </Notice>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
