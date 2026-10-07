"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, Menu } from "lucide-react";
import { useSiteSettings } from "@/components/site-settings-provider";
import { platformName, telHref, visibleSocials } from "@/types/site-settings";
import { SocialIcon } from "@/components/contact/social-icons";

export function SiteHeader() {
  const pathname = usePathname();
  // Hide public navigation and header completely on secret admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo.svg"
            alt="Royal Ink"
            className="h-10 object-contain"
          />
        </Link>

        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 space-x-reverse text-sm font-medium">
          <button className="text-gray-600 hover:text-primary transition-colors">
            <Globe className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="text-primary font-semibold transition-colors hover:text-red-700"
          >
            الرئيسية
          </Link>
          <Link
            href="/compatibility"
            className="text-gray-600 transition-colors hover:text-primary font-semibold"
          >
            توافق الطابعات
          </Link>
          <Link
            href="/about"
            className="text-gray-600 transition-colors hover:text-primary"
          >
            من نحن
          </Link>
          <Link
            href="/quality"
            className="text-gray-600 transition-colors hover:text-primary"
          >
            الجودة
          </Link>
          <Link
            href="/find-us"
            className="text-gray-600 transition-colors hover:text-primary"
          >
            نقاط البيع
          </Link>
          <Link
            href="/contact"
            className="ri-btn ri-btn-red h-11 px-6 text-sm"
          >
            اتصل بنا
          </Link>
        </nav>
        {/* Hamburger (Mobile) */}
        <button className="md:hidden text-gray-800 hover:text-primary transition-colors">
          <Menu className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  // Email, phones, address and social accounts — editable in the admin
  const settings = useSiteSettings();
  const { email, phones, address } = settings;
  const socials = visibleSocials(settings);
  // Hide public footer on secret admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#1a1a1a] text-white pt-10 md:pt-14 pb-6">
      <div className="container mx-auto px-4">
        {/* Compact and start-aligned at every size: three columns from md
            up, stacked on phones; quick links always in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-16 border-b border-white/10 pb-8 md:pb-10 mb-6">
          {/* Brand Col */}
          <div className="space-y-4 flex flex-col items-start text-start">
            <img
              src="/images/logo-footer-new.svg"
              alt="Royal Ink"
              className="h-9 md:h-10"
            />
            <div className="space-y-2 text-[13px] md:text-sm text-gray-400 md:max-w-sm">
              <p className="font-semibold text-gray-300">
                روايال إنك: دقة في كل طباعة.
              </p>
              <p className="leading-relaxed">
                خراطيش الحبر الفاخرة ومستلزمات الطباعة. نعزز الوضوح ونطيل عمر
                الطابعة. مستلزمات طباعة سريعة وموثوقة للشركات الجزائرية.
              </p>
            </div>
            {socials.length > 0 && (
              <div className="flex items-center justify-start gap-4">
                <span className="text-sm font-medium">تابعونا</span>
                <div className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platformName(s.id)}
                      className="w-8 h-8 bg-white flex items-center justify-center text-primary transition-colors hover:bg-brand-red hover:text-white"
                    >
                      <SocialIcon id={s.id} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4 flex flex-col items-start text-start">
            <h3 className="text-base md:text-lg font-semibold">روابط سريعة</h3>
            <nav className="grid w-full max-w-xs grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors w-fit">
                الرئيسية
              </Link>
              <Link
                href="/compatibility"
                className="hover:text-white transition-colors w-fit"
              >
                توافق الطابعات
              </Link>
              <Link
                href="/about"
                className="hover:text-white transition-colors w-fit"
              >
                من نحن
              </Link>
              <Link
                href="/quality"
                className="hover:text-white transition-colors w-fit"
              >
                الجودة
              </Link>
              <Link
                href="/find-us"
                className="hover:text-white transition-colors w-fit"
              >
                نقاط البيع
              </Link>
              <Link
                href="/contact"
                className="hover:text-white transition-colors w-fit"
              >
                اتصل بنا
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 flex flex-col items-start text-start">
            <h3 className="text-base md:text-lg font-semibold">تواصل معنا</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3 justify-start">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-start gap-3 justify-start">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {/* One number per line so neither ever breaks mid-number */}
                <span className="flex flex-col items-start gap-1">
                  {phones.map((p) => (
                    <a key={p} dir="ltr" href={telHref(p)} className="whitespace-nowrap hover:text-white transition-colors">
                      {p}
                    </a>
                  ))}
                </span>
              </div>
              <div className="flex items-start gap-3 justify-start">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="max-w-[16rem] whitespace-pre-line">{address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 font-medium tracking-wider">
          ROYAL INK — &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}
