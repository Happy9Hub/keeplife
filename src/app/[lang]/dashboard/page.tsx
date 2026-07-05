import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

type DashboardPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${lang}/signin`);
  }

  if (!session.user.activeHouseholdId) {
    redirect(`/${lang}/onboarding`);
  }

  const name = session.user.name ?? "there";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <section className="mx-auto w-full max-w-2xl text-center">
        <p className="text-sm font-medium text-zinc-500">KeepLife</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Welcome to your dashboard, {name}
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Expense tracking and reminders coming soon.
        </p>
      </section>
    </main>
  );
}
