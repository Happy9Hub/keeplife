import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, locales } from "@/lib/i18n";

import "../globals.css";

export const metadata: Metadata = {
  title: "KeepLife",
  description: "Household finance, maintenance, and reminder tracking.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
