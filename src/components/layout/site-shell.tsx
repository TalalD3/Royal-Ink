"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, Menu } from "lucide-react";

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
            className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
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
  // Hide public footer on secret admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-12 mb-6">
          {/* Brand Col */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-start">
            <img
              src="/images/logo-footer-new.svg"
              alt="Royal Ink"
              className="h-10"
            />
            <div className="space-y-4 text-sm text-gray-400">
              <p className="font-semibold text-gray-300">
                روايال إنك: دقة في كل طباعة.
              </p>
              <p className="leading-relaxed">
                خراطيش الحبر الفاخرة ومستلزمات الطباعة. نعزز الوضوح ونطيل عمر
                الطابعة. مستلزمات طباعة سريعة وموثوقة للشركات الجزائرية.
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <span className="text-sm font-medium">تواصل معنا</span>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="text-lg font-semibold">روابط سريعة</h3>
            <nav className="flex flex-col space-y-3 text-sm text-gray-400 items-center md:items-start">
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
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="text-lg font-semibold">تواصل معنا</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-center gap-3 justify-center md:justify-start">
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
                <span>royalinkdz@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span dir="ltr">+213 666 50 99 41 | +213 550 89 94 84</span>
              </div>
              <div className="flex items-start gap-3 justify-center md:justify-start">
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
                <span>
                  دبي، مدينة العلمة 19001
                  <br />
                  سطيف، الجزائر
                </span>
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
