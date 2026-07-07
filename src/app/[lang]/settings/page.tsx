import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type SettingsPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader
        dictionary={dictionary}
        householdName={household?.name}
        lang={lang}
        userName={session.user.name ?? ""}
      />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="mx-auto w-full max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {dictionary.settings.title}
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {dictionary.settings.comingSoon}
          </p>
        </section>
      </main>
    </div>
  );
}
