import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AddRecordDialog } from "@/features/records/components/AddRecordDialog";
import { ColumnHeaderMenu } from "@/features/records/components/ColumnHeaderMenu";
import { MonthNavigator } from "@/features/records/components/MonthNavigator";
import { RecordRowActions } from "@/features/records/components/RecordRowActions";
import { SortHeader } from "@/features/records/components/SortHeader";
import {
  EXPENSE_SCOPES,
  RECORD_TYPES,
} from "@/features/records/schemas/record.schema";
import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type RecordsPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_FIELDS = { date: "recordDate", amount: "amount", title: "title" } as const;

type SortKey = keyof typeof SORT_FIELDS;
type FilterParam = "category" | "paymentSource" | "type" | "scope";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function monthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export default async function RecordsPage({ params, searchParams }: RecordsPageProps) {
  const { lang } = await params;
  const sp = await searchParams;

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

  const locale = lang === "th" ? "th-TH-u-ca-gregory" : "en-GB";
  const currencyLocale = lang === "th" ? "th-TH" : "en-US";
  const currencyFormatter = new Intl.NumberFormat(currencyLocale, {
    style: "currency",
    currency: "THB",
    currencyDisplay: "narrowSymbol",
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const monthFormatter = new Intl.DateTimeFormat(lang === "th" ? "th-TH-u-ca-gregory" : "en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const monthShortFormatter = new Intl.DateTimeFormat(
    lang === "th" ? "th-TH-u-ca-gregory" : "en-US",
    { month: "short", timeZone: "UTC" },
  );
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    monthShortFormatter.format(new Date(Date.UTC(2020, index, 1))),
  );
  const formatAmount = (amount: number) => currencyFormatter.format(amount);

  // Resolve the selected month (?month=YYYY-MM), defaulting to the current month.
  const monthParam = firstString(sp.month);
  let year: number;
  let monthIndex: number;
  if (MONTH_PATTERN.test(monthParam)) {
    const [rawYear, rawMonth] = monthParam.split("-").map(Number);
    year = rawYear;
    monthIndex = rawMonth - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthIndex = now.getMonth();
  }
  const monthStr = monthKey(year, monthIndex);
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1));
  const monthLabel = monthFormatter.format(monthStart);

  // Filter/sort state from the URL.
  const filters = {
    category: firstString(sp.category),
    paymentSource: firstString(sp.paymentSource),
    type: firstString(sp.type),
    scope: firstString(sp.scope),
    sort: firstString(sp.sort),
    dir: firstString(sp.dir),
  };

  // Cards summarize the whole selected month; the table can be filtered further.
  const monthWhere: Prisma.RecordWhereInput = {
    householdId,
    recordDate: { gte: monthStart, lt: monthEnd },
  };

  const where: Prisma.RecordWhereInput = { ...monthWhere };
  if (filters.category) {
    where.categoryId = filters.category;
  }
  if (filters.paymentSource) {
    where.paymentSourceId = filters.paymentSource;
  }
  if ((RECORD_TYPES as readonly string[]).includes(filters.type)) {
    where.type = filters.type as (typeof RECORD_TYPES)[number];
  }
  if ((EXPENSE_SCOPES as readonly string[]).includes(filters.scope)) {
    where.scope = filters.scope as (typeof EXPENSE_SCOPES)[number];
  }

  const sortKey: SortKey = filters.sort in SORT_FIELDS ? (filters.sort as SortKey) : "date";
  const sortDir: Prisma.SortOrder = filters.dir === "asc" ? "asc" : "desc";
  const orderBy: Prisma.RecordOrderByWithRelationInput = { [SORT_FIELDS[sortKey]]: sortDir };

  const [household, categories, paymentSources, records, monthByScope, remindersForRecords] =
    await Promise.all([
    prisma.household.findUnique({
      where: { id: householdId },
      select: { name: true },
    }),
    prisma.category.findMany({
      where: { householdId },
      orderBy: [{ kind: "asc" }, { nameEn: "asc" }],
    }),
    prisma.paymentSource.findMany({
      where: { householdId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.record.findMany({
      where,
      orderBy,
      include: {
        category: { select: { nameEn: true, nameTh: true } },
        paymentSource: { select: { name: true } },
        user: { select: { name: true } },
      },
      take: 100,
    }),
    prisma.record.groupBy({
      by: ["scope"],
      where: monthWhere,
      _sum: { amount: true },
    }),
    prisma.reminder.findMany({
      where: { householdId, status: "pending", recordId: { not: null } },
      select: { recordId: true },
    }),
  ]);

  // Records that already have an open (pending) reminder linked to them.
  const recordsWithReminder = new Set(
    remindersForRecords.map((reminder) => reminder.recordId),
  );

  const scopeTotals = Object.fromEntries(
    monthByScope.map((group) => [group.scope, Number(group._sum.amount ?? 0)]),
  );
  const sharedTotal = scopeTotals.SHARED ?? 0;
  const privateTotal = scopeTotals.PRIVATE ?? 0;
  const totalSpent = sharedTotal + privateTotal;

  const categoryLabel = (category: { nameEn: string; nameTh: string }) =>
    lang === "th" ? category.nameTh : category.nameEn;

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    label: categoryLabel(category),
  }));

  const paymentSourceOptions = paymentSources.map((paymentSource) => ({
    id: paymentSource.id,
    label: paymentSource.name,
  }));

  const recordFormDict = {
    ...dictionary.records.form,
    types: dictionary.records.types,
    scopes: dictionary.records.scopes,
  };

  const rowActionsDict = {
    edit: dictionary.records.edit,
    delete: dictionary.records.delete,
    actions: dictionary.records.columns.actions,
    editExpense: dictionary.records.editExpense,
    deleteTitle: dictionary.records.deleteTitle,
    deleteConfirm: dictionary.records.deleteConfirm,
    deleting: dictionary.records.deleting,
    deleteError: dictionary.records.deleteError,
    cancel: dictionary.records.cancel,
    saveChanges: dictionary.records.form.saveChanges,
    createReminder: dictionary.reminders.createFromRecord,
    reminderSet: dictionary.reminders.reminderSet,
    form: recordFormDict,
    reminderForm: {
      ...dictionary.reminders.form,
      types: dictionary.reminders.types,
    },
  };

  // Build a menu-item href by merging a change into the current params.
  const basePath = `/${lang}/records`;
  // Params to keep when the month changes via the picker (everything but month).
  const preservedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      preservedParams[key] = value;
    }
  }
  const currentParams: Record<string, string> = { ...filters, month: monthStr };
  const hrefWith = (changes: Record<string, string>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...currentParams, ...changes })) {
      if (value) {
        query.set(key, value);
      }
    }
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Clicking a sort column toggles asc/desc (new columns start ascending).
  const sortHref = (field: SortKey) =>
    hrefWith({
      sort: field,
      dir: sortKey === field && sortDir === "asc" ? "desc" : "asc",
    });
  const sortIndicator = (field: SortKey) => (sortKey === field ? sortDir : null);

  const filterItems = (param: FilterParam, options: { value: string; label: string }[]) => [
    { label: dictionary.records.all, href: hrefWith({ [param]: "" }), active: !filters[param] },
    ...options.map((option) => ({
      label: option.label,
      href: hrefWith({ [param]: option.value }),
      active: filters[param] === option.value,
    })),
  ];
  const filterIndicator = (param: FilterParam) => (filters[param] ? ("filter" as const) : null);

  const typeOptions = RECORD_TYPES.map((type) => ({
    value: type,
    label: dictionary.records.types[type],
  }));
  const scopeOptions = EXPENSE_SCOPES.map((scope) => ({
    value: scope,
    label: dictionary.records.scopes[scope],
  }));
  const categoryFilterOptions = categoryOptions.map((c) => ({ value: c.id, label: c.label }));
  const paymentFilterOptions = paymentSourceOptions.map((p) => ({ value: p.id, label: p.label }));

  const hasActiveFilters = Boolean(
    filters.category || filters.paymentSource || filters.type || filters.scope,
  );

  const summaryCards = [
    { label: dictionary.records.summary.totalSpent, value: totalSpent },
    { label: dictionary.records.summary.shared, value: sharedTotal },
    { label: dictionary.records.summary.private, value: privateTotal },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader
        dictionary={dictionary}
        householdName={household?.name}
        lang={lang}
        userName={session.user.name ?? ""}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {dictionary.records.title}
            </h1>
            <MonthNavigator
              basePath={basePath}
              label={monthLabel}
              monthNames={monthNames}
              nextYearLabel={dictionary.records.nextYear}
              prevYearLabel={dictionary.records.prevYear}
              preservedParams={preservedParams}
              selectedMonthIndex={monthIndex}
              selectedYear={year}
            />
          </div>

          <AddRecordDialog
            categories={categoryOptions}
            dict={{
              addExpense: dictionary.records.addExpense,
              form: recordFormDict,
            }}
            paymentSources={paymentSourceOptions}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {formatAmount(card.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-border">
          {records.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {hasActiveFilters ? dictionary.records.noResults : dictionary.records.empty}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted text-left">
                <tr>
                  <th className="px-4 py-3">
                    <SortHeader
                      href={sortHref("date")}
                      indicator={sortIndicator("date")}
                      label={dictionary.records.columns.date}
                    />
                  </th>
                  <th className="px-4 py-3">
                    <SortHeader
                      href={sortHref("title")}
                      indicator={sortIndicator("title")}
                      label={dictionary.records.columns.title}
                    />
                  </th>
                  <th className="px-4 py-3">
                    <ColumnHeaderMenu
                      indicator={filterIndicator("category")}
                      items={filterItems("category", categoryFilterOptions)}
                      label={dictionary.records.columns.category}
                    />
                  </th>
                  <th className="px-4 py-3">
                    <ColumnHeaderMenu
                      indicator={filterIndicator("type")}
                      items={filterItems("type", typeOptions)}
                      label={dictionary.records.columns.type}
                    />
                  </th>
                  <th className="px-4 py-3">
                    <ColumnHeaderMenu
                      indicator={filterIndicator("paymentSource")}
                      items={filterItems("paymentSource", paymentFilterOptions)}
                      label={dictionary.records.columns.paymentSource}
                    />
                  </th>
                  <th className="px-4 py-3">
                    <ColumnHeaderMenu
                      indicator={filterIndicator("scope")}
                      items={filterItems("scope", scopeOptions)}
                      label={dictionary.records.columns.scope}
                    />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader
                      href={sortHref("amount")}
                      indicator={sortIndicator("amount")}
                      label={dictionary.records.columns.amount}
                    />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <span className="sr-only">{dictionary.records.columns.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {dateFormatter.format(record.recordDate)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{record.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryLabel(record.category)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{dictionary.records.types[record.type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{record.paymentSource.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={record.scope === "SHARED" ? "blue" : "secondary"}>
                        {dictionary.records.scopes[record.scope]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">
                      {formatAmount(Number(record.amount))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <RecordRowActions
                        categories={categoryOptions}
                        dict={rowActionsDict}
                        hasReminder={recordsWithReminder.has(record.id)}
                        paymentSources={paymentSourceOptions}
                        recordId={record.id}
                        values={{
                          title: record.title,
                          amount: record.amount.toString(),
                          categoryId: record.categoryId,
                          paymentSourceId: record.paymentSourceId,
                          type: record.type,
                          scope: record.scope,
                          recordDate: record.recordDate.toISOString().slice(0, 10),
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
