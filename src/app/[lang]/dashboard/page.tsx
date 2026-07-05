import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${lang}/signin`);
  }

  if (!session.user.activeHouseholdId) {
    redirect(`/${lang}/onboarding`);
  }

  const dictionary = await getDictionary(lang);
  const household = await prisma.household.findUnique({
    where: { id: session.user.activeHouseholdId },
    select: { name: true },
  });

  const name = session.user.name ?? "there";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col">
          <Link
            href={`/${lang}`}
            className="text-sm font-semibold tracking-tight text-zinc-950 transition hover:opacity-80"
          >
            {dictionary.landing.nav.logo}
          </Link>
          {household ? (
            <span className="text-xs text-zinc-500">
              {dictionary.dashboard.householdLabel}: {household.name}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={lang} />
          <SignOutButton dict={dictionary.dashboard.signOut} variant="outline" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="mx-auto w-full max-w-2xl text-center">
          <p className="text-sm font-medium text-zinc-500">
            {dictionary.dashboard.title}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {dictionary.dashboard.greeting} {name}
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            {dictionary.dashboard.comingSoon}
          </p>
        </section>
      </main>
    </div>
  );
}
