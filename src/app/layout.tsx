import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n-server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const metadata: Metadata = {
  title: "Yang Yao Palace | Chinese Language Academy",
  description:
    "Yang Yao Palace — learn Mandarin Chinese with native teachers, structured HSK courses, and live group lessons.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale === "he" ? "he" : locale === "zh" ? "zh" : "en"}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="fixed right-4 top-4 z-50">
          <LanguageSwitcher current={locale} />
        </div>
        {children}
      </body>
    </html>
  );
}
