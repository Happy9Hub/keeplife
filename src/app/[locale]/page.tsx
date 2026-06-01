import { notFound } from "next/navigation";

import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="relative flex min-h-screen flex-col bg-white">
      <Navbar dictionary={dictionary} locale={locale} />
      <HeroSection dictionary={dictionary.landing.hero} />
    </main>
  );
}
