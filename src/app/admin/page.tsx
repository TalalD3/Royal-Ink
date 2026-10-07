"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAdminHint, setAdminHint } from "@/lib/admin-hint";
import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { AdminDistributorsManager } from "@/components/admin/admin-distributors-manager";
import { AdminSlidesManager } from "@/components/admin/admin-slides-manager";
import { LoadingBlock } from "@/components/admin/admin-ui";
import { ExternalLink, Image as ImageIcon, LogOut, MapPin, Package, Settings } from "lucide-react";
import { AdminSettingsManager } from "@/components/admin/admin-settings-manager";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD — black top bar (logo, site link, logout), three square
   tabs, and the selected manager underneath.
   ══════════════════════════════════════════════════════════════════════ */

type Tab = "products" | "distributors" | "slides" | "settings";

const TABS: { id: Tab; label: string; short: string; icon: typeof Package }[] = [
  { id: "products", label: "كتالوج المنتجات", short: "المنتجات", icon: Package },
  { id: "distributors", label: "نقاط البيع", short: "نقاط البيع", icon: MapPin },
  { id: "slides", label: "شرائح الواجهة", short: "الشرائح", icon: ImageIcon },
  { id: "settings", label: "معلومات التواصل والإعدادات", short: "الإعدادات", icon: Settings },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check the login
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/admin/session").catch(() => null);
      if (!res?.ok) {
        router.replace("/admin/login");
        return;
      }
      const json = await res.json().catch(() => ({}));
      setUserEmail(json.email ?? null);
      setAdminHint(); // lets the floating admin button appear on the site
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  // Remember the last tab
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ri-admin-tab") as Tab | null;
      if (saved && TABS.some((t) => t.id === saved)) setActiveTab(saved);
    } catch {
      // ignore
    }
  }, []);
  const selectTab = (t: Tab) => {
    setActiveTab(t);
    try {
      sessionStorage.setItem("ri-admin-tab", t);
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    clearAdminHint();
    router.replace("/admin/login");
    router.refresh();
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoadingBlock label="جارٍ التحقق من هوية المسؤول…" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-brand-mist pb-16">
      {/* ─── Top bar ─── */}
      <header className="sticky top-0 z-40">
        <div className="bg-brand-black text-white">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/admin" aria-label="لوحة الإدارة" className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo-footer-new.svg" alt="Royal Ink" className="h-8 w-auto" />
              </Link>
              <span className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
              <span className="hidden text-sm font-extrabold sm:block">لوحة الإدارة</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {userEmail && (
                <span dir="ltr" className="hidden max-w-[220px] truncate text-xs font-semibold text-white/60 md:block">
                  {userEmail}
                </span>
              )}
              <Link
                href="/"
                target="_blank"
                className="inline-flex h-10 items-center gap-2 px-3 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">عرض الموقع</span>
                <span className="sr-only sm:hidden">عرض الموقع</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 bg-brand-red px-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-brand-black sm:px-4"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <nav aria-label="أقسام لوحة الإدارة" className="border-b border-brand-line bg-white">
          <div className="mx-auto grid max-w-[1400px] grid-cols-4 sm:flex sm:px-6">
            {TABS.map((t) => {
              const on = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTab(t.id)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-extrabold transition-colors sm:flex-row sm:gap-2 sm:px-5 sm:py-4 sm:text-sm",
                    on ? "text-brand-black" : "text-brand-gray hover:text-brand-black"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center transition-colors sm:h-7 sm:w-7",
                      on ? "bg-brand-red text-white" : "bg-brand-mist text-brand-black"
                    )}
                  >
                    <t.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                  {on && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-brand-red" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ─── The selected section ─── */}
      <main className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 sm:pt-8">
        {activeTab === "products" ? (
          <AdminProductsManager />
        ) : activeTab === "distributors" ? (
          <AdminDistributorsManager />
        ) : activeTab === "slides" ? (
          <AdminSlidesManager />
        ) : (
          <AdminSettingsManager />
        )}
      </main>
    </div>
  );
}
