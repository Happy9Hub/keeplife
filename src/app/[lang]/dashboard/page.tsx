import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { CategorySpend } from "@/features/dashboard/components/CategorySpend";
import { DashboardGreeting } from "@/features/dashboard/components/DashboardGreeting";
import { ExpenseChart } from "@/features/dashboard/components/ExpenseChart";
import { MetricCards } from "@/features/dashboard/components/MetricCards";
import { NongLeafCard } from "@/features/dashboard/components/NongLeafCard";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";
import { UpcomingBills } from "@/features/dashboard/components/UpcomingBills";
import { auth } from "@/auth";
import { formatBaht, formatThaiDate } from "@/lib/format";
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

  const householdId = session.user.activeHouseholdId;
  const dictionary = await getDictionary(lang);

  // Month + 7-day windows (UTC, matching how record/reminder dates are stored).
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const in7Days = new Date(todayStart.getTime() + 7 * 86_400_000);

  const [
    household,
    spentThisMonth,
    spentLastMonth,
    billsDueCount,
    upcomingReminders,
    spendByCategory,
    categories,
    recentRecords,
  ] = await Promise.all([
    prisma.household.findUnique({
      where: { id: householdId },
      select: { name: true },
    }),
    prisma.record.aggregate({
      where: { householdId, recordDate: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.record.aggregate({
      where: { householdId, recordDate: { gte: lastMonthStart, lt: monthStart } },
      _sum: { amount: true },
    }),
    prisma.reminder.count({
      where: {
        householdId,
        status: "pending",
        dueDate: { gte: todayStart, lt: in7Days },
      },
    }),
    prisma.reminder.findMany({
      where: { householdId, status: "pending", dueDate: { gte: todayStart } },
      orderBy: { dueDate: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        dueDate: true,
        record: { select: { amount: true } },
      },
    }),
    prisma.record.groupBy({
      by: ["categoryId"],
      where: { householdId, recordDate: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
    prisma.category.findMany({
      where: { householdId },
      select: { id: true, nameEn: true, nameTh: true, kind: true },
    }),
    prisma.record.findMany({
      where: { householdId },
      orderBy: { recordDate: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        amount: true,
        recordDate: true,
        category: { select: { nameEn: true, nameTh: true } },
      },
    }),
  ]);

  const thisMonthTotal = Number(spentThisMonth._sum.amount ?? 0);
  const lastMonthTotal = Number(spentLastMonth._sum.amount ?? 0);
  const deltaPct =
    lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : null;

  const categoryLabel = (c: { nameEn: string; nameTh: string }) =>
    lang === "th" ? c.nameTh : c.nameEn;

  const upcomingBills = upcomingReminders.map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    type: reminder.type,
    daysUntil: Math.round((reminder.dueDate.getTime() - todayStart.getTime()) / 86_400_000),
    amount: reminder.record
      ? formatBaht(lang, Number(reminder.record.amount))
      : undefined,
    dueDateLabel: formatThaiDate(lang, reminder.dueDate),
  }));

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const categorySpend = spendByCategory.map((group) => {
    const category = categoryById.get(group.categoryId);
    const amount = Number(group._sum.amount ?? 0);
    return {
      id: group.categoryId,
      label: category ? categoryLabel(category) : group.categoryId,
      kind: category?.kind ?? "variable",
      amount: formatBaht(lang, amount),
      sharePct: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
    };
  });

  const recentTransactions = recentRecords.map((record) => ({
    id: record.id,
    title: record.title,
    category: categoryLabel(record.category),
    amount: formatBaht(lang, Number(record.amount)),
    dateLabel: formatThaiDate(lang, record.recordDate),
  }));

  const name = session.user.name ?? "";
  const dateLabel = formatThaiDate(lang, new Date());

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        dictionary={dictionary}
        householdName={household?.name}
        lang={lang}
        userName={session.user.name ?? ""}
      />

      <main className="mx-auto w-full max-w-[1100px] flex-1 space-y-6 px-6 py-8">
        <DashboardGreeting
          dateLabel={dateLabel}
          hello={dictionary.dashboard.hello}
          name={name}
        />

        <NongLeafCard dict={dictionary.dashboard.assistant} />

        <MetricCards
          billsCount={billsDueCount}
          deltaPct={deltaPct}
          dict={dictionary.dashboard.metrics}
          spentAmount={formatBaht(lang, thisMonthTotal)}
        />

        {/* Row A: spending chart (~60%) + upcoming bills (~40%) */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ExpenseChart dict={dictionary.dashboard.chart} locale={lang} />
          </div>
          <div className="lg:col-span-2">
            <UpcomingBills dict={dictionary.dashboard.bills} items={upcomingBills} />
          </div>
        </div>

        {/* Row B: spending by category (~60%) + recent transactions (~40%) */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CategorySpend
              dict={dictionary.dashboard.categorySpend}
              items={categorySpend}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentTransactions
              dict={dictionary.dashboard.recentTransactions}
              href={`/${lang}/records`}
              items={recentTransactions}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
