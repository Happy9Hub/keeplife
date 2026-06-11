import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { OnboardingForm } from "@/features/auth/components/OnboardingForm";
import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";

type OnboardingPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${lang}/signup`);
  }

  if (session.user.householdId) {
    redirect(`/${lang}/dashboard`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher locale={lang} />
      </div>

      <section className="w-full max-w-md text-center">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            {dictionary.onboarding.title}
          </h1>
          <p className="text-sm leading-6 text-zinc-500">
            {dictionary.onboarding.subtitle}
          </p>
        </div>

        <OnboardingForm dict={dictionary.onboarding} lang={lang} />
      </section>
    </main>
  );
}
