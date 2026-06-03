import { notFound } from "next/navigation";

import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);

  return (
    <main className="relative flex min-h-screen flex-col bg-white">
      <Navbar dictionary={dictionary} locale={lang} />
      <HeroSection dictionary={dictionary.landing.hero} />
    </main>
  );
}
