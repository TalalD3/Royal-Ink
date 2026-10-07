import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/layout/site-shell";
import { AdminBubble } from "@/components/admin/admin-bubble";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { getSiteSettings } from "@/lib/site-settings";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Royal Ink - روايال إنك",
  description: "مستلزمات الطباعة والأجهزة من علامات عالمية",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Phones, email, address, social accounts… editable in the admin
  const settings = await getSiteSettings();

  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        {/* The inbox for form messages stays on the server */}
        <SiteSettingsProvider value={{ ...settings, formRecipient: "" }}>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          {/* Floating dashboard shortcut — only for a logged-in admin */}
          <AdminBubble />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
