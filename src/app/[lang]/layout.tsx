import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, locales } from "@/lib/i18n";

import "../globals.css";

export const metadata: Metadata = {
  title: "KeepLife",
  description: "Household finance, maintenance, and reminder tracking.",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
