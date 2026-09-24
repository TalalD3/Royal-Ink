"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { AdminDistributorsManager } from "@/components/admin/admin-distributors-manager";
import { AdminSlidesManager } from "@/components/admin/admin-slides-manager";
import {
  Printer,
  MapPin,
  LogOut,
  ExternalLink,
  Loader2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "distributors" | "slides">("products");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      setUserEmail(session.user.email ?? null);
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        <span className="text-xs text-muted-foreground">
          جاري التحقق من هوية المسؤول...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,97.5%)] dark:bg-background pb-12 select-none" dir="rtl">
      {/* ─── ADMIN HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Logo + Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <img
                src="/images/logo.svg"
                alt="Royal Ink"
                className="h-7 object-contain"
              />
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
                لوحة الإدارة
              </span>
            </div>
          </div>

          {/* Right: User + Links + Logout */}
          <div className="flex items-center gap-1 sm:gap-2">
            {userEmail && (
              <span className="hidden md:inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
                {userEmail}
              </span>
            )}

            <Link
              href="/compatibility"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">صفحة التوافق</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">الموقع</span>
            </Link>

            <div className="h-4 w-px bg-border mx-1" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* ─── TAB BAR ─── */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center gap-0 -mb-px">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-[12px] font-semibold transition-colors cursor-pointer ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>كتالوج المنتجات</span>
          </button>

          <button
            onClick={() => setActiveTab("distributors")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-[12px] font-semibold transition-colors cursor-pointer ${
              activeTab === "distributors"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>نقاط البيع</span>
          </button>

          <button
            onClick={() => setActiveTab("slides")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-[12px] font-semibold transition-colors cursor-pointer ${
              activeTab === "slides"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>شرائح الواجهة</span>
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-5">
        {activeTab === "products" ? (
          <AdminProductsManager />
        ) : activeTab === "distributors" ? (
          <AdminDistributorsManager />
        ) : (
          <AdminSlidesManager />
        )}
      </main>
    </div>
  );
}
