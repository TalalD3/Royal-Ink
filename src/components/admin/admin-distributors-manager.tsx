"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase, type DbDistributor } from "@/lib/supabase/client";
import { algeriaWilayas } from "@/data/algeria-wilayas";
import { badgeConfig, type BadgeTier } from "@/data/distributors";
import {
  exportDistributorsToExcel,
  downloadDistributorsTemplate,
  parseDistributorsExcel,
  type NewDistributorPayload,
} from "@/lib/excel/distributors-excel";
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
} from "lucide-react";

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/distributors", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("جلسة العمل منتهية، يرجى تسجيل الدخول مجدداً");

      if (editingItem) {
        const res = await fetch("/api/admin/distributors", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
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
            Authorization: `Bearer ${session.access_token}`,
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/distributors?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/distributors", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      setLoading(true);
      const res = await fetch("/api/admin/distributors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/distributors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/distributors?id=all", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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

  return (
    <div className="space-y-4">
      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">إجمالي نقاط البيع</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.total}</span>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">النقاط النشطة</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.activeCount}</span>
          </div>
        </div>

        {/* Wilayas covered */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">ولايات مغطاة</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">
              {stats.wilayasCovered}
              <span className="text-[11px] font-normal text-muted-foreground"> / 58</span>
            </span>
          </div>
        </div>

        {/* Coverage % */}
        <div className="bg-white dark:bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-blue-600">%</span>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">نسبة التغطية الوطنية</p>
            <span className="text-lg font-bold text-foreground tabular-nums leading-none">{stats.coveragePercentage}%</span>
          </div>
        </div>
      </div>

      {/* ─── TOOLBAR ─── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة نقطة بيع</span>
            </button>

            <button
              onClick={downloadDistributorsTemplate}
              title="تحميل ملف Excel تجريبي"
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-muted-foreground" />
              <span>نموذج Excel</span>
            </button>

            {distributors.length === 0 && !loading && (
              <button
                onClick={handleSeedDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>بذر بيانات نموذجية</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportDistributorsToExcel(distributors)}
              title="تصدير الكل إلى ملف Excel"
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>تصدير</span>
            </button>

            <button
              onClick={() => {
                setImportPreview(null);
                setIsImportModalOpen(true);
              }}
              title="استيراد نقاط بيع من ملف Excel"
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <span>استيراد</span>
            </button>

            {/* Clear all selling points — double confirmation */}
            {distributors.length > 0 && (
              <div className="relative">
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    title="إفراغ نقاط البيع"
                    className="inline-flex items-center gap-1 px-2 py-[7px] rounded-md text-[11px] font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">إفراغ</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-2 py-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-[11px] text-red-700 dark:text-red-400 font-medium">
                      حذف {distributors.length} نقطة؟
                    </span>
                    <button
                      onClick={handleDeleteAllDistributors}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الولاية أو الهاتف..."
              className="w-full h-9 pr-9 pl-8 rounded-md bg-white dark:bg-card border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={selectedWilayaFilter}
            onChange={(e) =>
              setSelectedWilayaFilter(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="h-9 pr-2.5 pl-10 rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">كل الولايات</option>
            {sortedWilayas.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} - {w.nameAr}
              </option>
            ))}
          </select>

          <select
            value={selectedBadgeFilter}
            onChange={(e) => setSelectedBadgeFilter(e.target.value)}
            className="h-9 pr-2.5 pl-10 rounded-md bg-white dark:bg-card border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[130px]"
          >
            <option value="all">كل الرتب</option>
            <option value="headquarters">المقر</option>
            <option value="premium">شريك رئيسي</option>
            <option value="authorized">موزع معتمد</option>
            <option value="standard">نقطة بيع</option>
          </select>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[12px]">جاري التحميل...</span>
        </div>
      ) : filteredDistributors.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-card border border-dashed border-border rounded-lg p-6">
          <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <h4 className="text-[13px] font-semibold text-foreground mb-1">
            لا توجد نقاط بيع مطابقة
          </h4>
          <p className="text-[11px] text-muted-foreground mb-3">
            جرب تعديل البحث أو أضف نقطة بيع جديدة.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة نقطة بيع</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-muted/40 dark:bg-muted/20 border-b border-border text-right">
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground">الاسم</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-28">الولاية</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden sm:table-cell w-24">الرتبة</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden md:table-cell w-32">الهاتف</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground hidden lg:table-cell w-20">الخريطة</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-16 text-center">الحالة</th>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-20 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDistributors.map((item) => {
                  const badge = badgeConfig[item.badge as BadgeTier] || badgeConfig.standard;
                  const wilaya = algeriaWilayas.find((w) => w.code === item.wilaya_code);

                  return (
                    <tr
                      key={item.id}
                      className={`group hover:bg-muted/30 transition-colors ${
                        !item.is_active ? "opacity-50" : ""
                      }`}
                    >
                      {/* Name + Address */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          {item.badge === "headquarters" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              HQ
                            </span>
                          )}
                        </div>
                        {item.address && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-[250px]">
                            {item.address}
                          </p>
                        )}
                      </td>

                      {/* Wilaya */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/60 px-1 py-0.5 rounded">
                            {String(item.wilaya_code).padStart(2, "0")}
                          </span>
                          <span className="text-[11px] font-medium text-foreground">
                            {wilaya?.nameAr || `ولاية ${item.wilaya_code}`}
                          </span>
                        </div>
                      </td>

                      {/* Badge */}
                      <td className="py-2 px-3 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.bgClass} ${badge.colorClass}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.labelAr}</span>
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-2 px-3 hidden md:table-cell" dir="ltr">
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-medium hover:text-primary transition-colors"
                          >
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{item.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Map link */}
                      <td className="py-2 px-3 hidden lg:table-cell">
                        {item.location_url ? (
                          <a
                            href={item.location_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>خريطة</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status toggle */}
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(item.id, item.is_active)}
                          className="cursor-pointer"
                          title={item.is_active ? "إخفاء" : "تفعيل"}
                        >
                          {item.is_active ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-muted-foreground/50" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="تعديل"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="حذف"
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-muted/20 dark:bg-muted/10 border-t border-border text-[11px] text-muted-foreground">
            عرض {filteredDistributors.length} من {distributors.length} نقطة بيع
          </div>
        </div>
      )}

      {/* ─── MODAL ADD / EDIT ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-card border border-border rounded-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[13px] font-semibold text-foreground">
                {editingItem ? "تعديل نقطة البيع" : "إضافة نقطة بيع جديدة"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {modalError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-[12px] font-medium rounded-md text-center">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1">
                  الاسم <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: مكتبة النور — موزع معتمد"
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1">الولاية</label>
                  <select
                    value={formWilaya}
                    onChange={(e) => setFormWilaya(Number(e.target.value))}
                    className="w-full h-9 px-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {sortedWilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1">الرتبة</label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value as BadgeTier)}
                    className="w-full h-9 px-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="authorized">موزع معتمد</option>
                    <option value="premium">شريك رئيسي</option>
                    <option value="standard">نقطة بيع</option>
                    <option value="headquarters">المقر الرئيسي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1">رابط الخريطة <span className="text-muted-foreground font-normal">(اختياري)</span></label>
                <input
                  type="url"
                  value={formLocationUrl}
                  onChange={(e) => setFormLocationUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  dir="ltr"
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1">الهاتف <span className="text-primary">*</span></label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+213 550 00 00 00"
                  dir="ltr"
                  className="w-full h-9 px-3 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1">العنوان</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="شارع الاستقلال، بجانب البريد..."
                  className="w-full p-2.5 rounded-md bg-white dark:bg-background border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItem ? "حفظ" : "إضافة"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EXCEL IMPORT MODAL ─── */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-card border border-border rounded-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-[13px] font-semibold text-foreground">استيراد نقاط البيع من Excel</h3>
                  <p className="text-[11px] text-muted-foreground">يدعم ملفات .xlsx و .xls</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={importFileInputRef}
              onChange={handleSelectExcelFile}
              accept=".xlsx, .xls"
              className="hidden"
            />

            <div
              onClick={() => importFileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/40 rounded-md p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-primary/5"
            >
              <Upload className="w-6 h-6 text-muted-foreground/50 mx-auto mb-1.5" />
              <p className="text-[12px] font-medium text-foreground mb-0.5">
                اضغط لاختيار ملف Excel لنقاط البيع
              </p>
              <span className="text-[10px] text-muted-foreground">
                استخدم زر "نموذج Excel" لتحميل جدول تجريبي منظم ومطابق
              </span>
            </div>

            {importing && (
              <div className="py-3 flex items-center justify-center gap-2 text-[12px] text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري قراءة ومعالجة البيانات...</span>
              </div>
            )}

            {importPreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[12px] font-medium">
                  <span>تم استخراج {importPreview.total} نقطة بيع بنجاح</span>
                  <span className="text-[11px]">جاهزة للحفظ</span>
                </div>

                {importPreview.errors.length > 0 && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-md text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                    {importPreview.errors.slice(0, 4).map((err, i) => (
                      <p key={i}>⚠ {err}</p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={importing || importPreview.total === 0}
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 rounded-md bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    تأكيد واستيراد ({importPreview.total})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
