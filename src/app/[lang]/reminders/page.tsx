import { Prisma } from "@prisma/client";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { AddReminderDialog } from "@/features/reminders/components/AddReminderDialog";
import { ReminderRowActions } from "@/features/reminders/components/ReminderRowActions";
import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type RemindersPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_FILTERS = ["upcoming", "completed", "dismissed", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const FILTER_TO_STATUS: Record<Exclude<StatusFilter, "all">, Prisma.EnumReminderStatusFilter | string> = {
  upcoming: "pending",
  completed: "completed",
  dismissed: "dismissed",
};

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function RemindersPage({ params, searchParams }: RemindersPageProps) {
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

  const dateFormatter = new Intl.DateTimeFormat(lang === "th" ? "th-TH-u-ca-gregory" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const requested = firstString(sp.status) as StatusFilter;
  const statusFilter: StatusFilter = STATUS_FILTERS.includes(requested) ? requested : "upcoming";

  const where: Prisma.ReminderWhereInput = { householdId };
  if (statusFilter !== "all") {
    where.status = FILTER_TO_STATUS[statusFilter] as Prisma.ReminderWhereInput["status"];
  }

  const reminders = await prisma.reminder.findMany({
    where,
    orderBy: { dueDate: "asc" },
    take: 100,
  });

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const reminderFormDict = {
    ...dictionary.reminders.form,
    types: dictionary.reminders.types,
  };

  const rowActionsDict = {
    edit: dictionary.reminders.edit,
    delete: dictionary.reminders.delete,
    markDone: dictionary.reminders.markDone,
    dismiss: dictionary.reminders.dismiss,
    actions: dictionary.reminders.columns.actions,
    editReminder: dictionary.reminders.editReminder,
    deleteTitle: dictionary.reminders.deleteTitle,
    deleteConfirm: dictionary.reminders.deleteConfirm,
    deleting: dictionary.reminders.deleting,
    deleteError: dictionary.reminders.deleteError,
    cancel: dictionary.reminders.cancel,
    saveChanges: dictionary.reminders.form.saveChanges,
    form: reminderFormDict,
  };

  const statusVariant = (status: string) =>
    status === "completed" ? "blue" : status === "dismissed" ? "outline" : "secondary";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader
        dictionary={dictionary}
        householdName={undefined}
        lang={lang}
        userName={session.user.name ?? ""}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {dictionary.reminders.title}
          </h1>
          <AddReminderDialog
            dict={{ add: dictionary.reminders.add, form: reminderFormDict }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-1">
          {STATUS_FILTERS.map((filter) => (
            <Link
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === filter
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              href={`/${lang}/reminders?status=${filter}`}
              key={filter}
            >
              {dictionary.reminders.filters[filter]}
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-border">
          {reminders.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {dictionary.reminders.empty}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{dictionary.reminders.columns.dueDate}</th>
                  <th className="px-4 py-3">{dictionary.reminders.columns.title}</th>
                  <th className="px-4 py-3">{dictionary.reminders.columns.type}</th>
                  <th className="px-4 py-3">{dictionary.reminders.columns.recurring}</th>
                  <th className="px-4 py-3">{dictionary.reminders.columns.status}</th>
                  <th className="px-4 py-3 text-right">
                    <span className="sr-only">{dictionary.reminders.columns.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reminders.map((reminder) => {
                  const isOverdue =
                    reminder.status === "pending" && reminder.dueDate < todayStart;

                  return (
                    <tr key={reminder.id}>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={cn(isOverdue ? "font-medium text-destructive" : "text-muted-foreground")}>
                          {dateFormatter.format(reminder.dueDate)}
                        </span>
                        {isOverdue ? (
                          <span className="ml-2 text-xs font-medium text-destructive">
                            {dictionary.reminders.overdue}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{reminder.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {dictionary.reminders.types[reminder.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {reminder.isRecurring && reminder.intervalMonths
                          ? dictionary.reminders.recurring.everyMonths.replace(
                              "{n}",
                              String(reminder.intervalMonths),
                            )
                          : dictionary.reminders.recurring.oneOff}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(reminder.status)}>
                          {dictionary.reminders.statuses[reminder.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <ReminderRowActions
                          dict={rowActionsDict}
                          reminderId={reminder.id}
                          status={reminder.status}
                          values={{
                            title: reminder.title,
                            type: reminder.type,
                            dueDate: reminder.dueDate.toISOString().slice(0, 10),
                            isRecurring: reminder.isRecurring,
                            intervalMonths:
                              reminder.intervalMonths != null
                                ? String(reminder.intervalMonths)
                                : "",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
