"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg("بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.");
      } else if (data.session) {
        router.replace("/admin");
      }
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بالخادم. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/20 px-4 py-12 select-none" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-card border border-border/60 rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5 backdrop-blur-sm">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              بوابة الإدارة
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              إدارة نقاط البيع وشبكة التوزيع الوطنية لـ Royal Ink
            </p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@royalink.dz"
                  dir="ltr"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-background border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-background border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>دخول لوحة التحكم</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Subtle note */}
          <div className="mt-8 pt-6 border-t border-border/40 text-center">
            <span className="text-[11px] text-muted-foreground/70">
              خاص بإدارة الموقع ومسؤولي التوزيع فقط
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
