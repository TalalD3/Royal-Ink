"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAdminHint } from "@/lib/admin-hint";
import { ArrowLeft, Eye, EyeOff, Image as ImageIcon, Lock, Mail, MapPin, Package } from "lucide-react";
import { Btn, Field, LoadingBlock, Notice, inputCls } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════
   ADMIN LOGIN — the logo's two blocks: a black block (what the dashboard
   manages) beside a white form. Phones: a compact black band on top.
   ══════════════════════════════════════════════════════════════════════ */

const MANAGES = [
  { icon: Package, label: "كتالوج المنتجات والمواصفات" },
  { icon: MapPin, label: "نقاط البيع على الخريطة" },
  { icon: ImageIcon, label: "شرائح الواجهة الرئيسية" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // If already logged in, go straight to the dashboard
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/admin/session").catch(() => null);
      if (res?.ok) {
        router.replace("/admin");
      } else {
        setCheckingSession(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json.error || "بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.");
      } else {
        setAdminHint();
        router.replace("/admin");
        router.refresh();
      }
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بالخادم. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoadingBlock label="جارٍ التحقق…" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ─── The black block ─── */}
      <aside className="relative isolate flex flex-col overflow-hidden bg-brand-black text-white">
        <div
          aria-hidden="true"
          className="ri-raster pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_left,#000,transparent_75%)]"
        />
        <div className="flex flex-1 flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-12">
          <Link href="/" className="inline-flex w-fit" aria-label="الموقع">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-footer-new.svg" alt="Royal Ink" className="h-9 w-auto lg:h-11" />
          </Link>

          <div className="mt-6 lg:mt-auto">
            <p className="ri-eyebrow ri-eyebrow-light mb-3">لوحة الإدارة</p>
            <h1 className="text-2xl font-extrabold leading-snug sm:text-3xl lg:text-[2.5rem] lg:leading-tight">
              بوابة الإدارة
            </h1>
            <p className="mt-3 hidden max-w-sm text-base leading-8 text-white/70 lg:block">
              مساحة خاصة بإدارة محتوى موقع روايال إنك.
            </p>
            <ul className="mt-8 hidden space-y-3 lg:block">
              {MANAGES.map((m) => (
                <li key={m.label} className="flex items-center gap-3 text-sm font-bold text-white/85">
                  <span className="flex h-9 w-9 items-center justify-center bg-white/10">
                    <m.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {m.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div aria-hidden="true" className="ri-colorbar h-2" />
      </aside>

      {/* ─── The form ─── */}
      <main className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">
          <p className="ri-eyebrow mb-3">تسجيل الدخول</p>
          <h2 className="text-2xl font-extrabold text-brand-black">مرحباً بعودتك</h2>
          <p className="mt-2 text-sm leading-6 text-brand-gray">أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.</p>

          {errorMsg && (
            <div className="mt-6">
              <Notice tone="danger">{errorMsg}</Notice>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <Field label="البريد الإلكتروني" htmlFor="admin-email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@royalink.dz"
                  dir="ltr"
                  className={cn(inputCls, "h-12 pl-10 text-left")}
                />
              </div>
            </Field>

            <Field label="كلمة المرور" htmlFor="admin-password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  dir="ltr"
                  className={cn(inputCls, "h-12 pl-10 pr-12 text-left")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-gray hover:text-brand-black"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Btn type="submit" variant="red" loading={loading} className="h-12 w-full text-[15px]">
              {loading ? "جارٍ تسجيل الدخول…" : "دخول لوحة التحكم"}
              {!loading && <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            </Btn>
          </form>

          <p className="mt-8 border-t border-brand-line pt-5 text-xs leading-5 text-brand-gray">
            خاص بإدارة الموقع فقط. نسيت كلمة المرور؟ يمكن تغييرها من جهاز الإدارة بالأمر{" "}
            <span dir="ltr" className="font-bold text-brand-black">npm run admin:create</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
