import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { AddRecordDialog } from "@/features/records/components/AddRecordDialog";
import { RecordRowActions } from "@/features/records/components/RecordRowActions";
import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type RecordsPageProps = {
  params: Promise<{ lang: string }>;
};

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function RecordsPage({ params }: RecordsPageProps) {
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

  const [household, categories, paymentSources, records] = await Promise.all([
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
      where: { householdId },
      orderBy: { recordDate: "desc" },
      include: {
        category: { select: { nameEn: true, nameTh: true } },
        paymentSource: { select: { name: true } },
        user: { select: { name: true } },
      },
      take: 100,
    }),
  ]);

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
    editExpense: dictionary.records.editExpense,
    deleteTitle: dictionary.records.deleteTitle,
    deleteConfirm: dictionary.records.deleteConfirm,
    deleting: dictionary.records.deleting,
    deleteError: dictionary.records.deleteError,
    cancel: dictionary.records.cancel,
    saveChanges: dictionary.records.form.saveChanges,
    form: recordFormDict,
  };

  const total = records.reduce((sum, record) => sum + Number(record.amount), 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader
        dictionary={dictionary}
        householdName={household?.name}
        lang={lang}
        userName={session.user.name ?? ""}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              {dictionary.records.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {dictionary.records.total}: {formatAmount(total)}
            </p>
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

        <div className="mt-8 overflow-hidden rounded-md border border-zinc-200">
          {records.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-zinc-500">
              {dictionary.records.empty}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{dictionary.records.columns.date}</th>
                  <th className="px-4 py-3 font-medium">{dictionary.records.columns.title}</th>
                  <th className="px-4 py-3 font-medium">{dictionary.records.columns.category}</th>
                  <th className="px-4 py-3 font-medium">
                    {dictionary.records.columns.paymentSource}
                  </th>
                  <th className="px-4 py-3 font-medium">{dictionary.records.columns.scope}</th>
                  <th className="px-4 py-3 text-right font-medium">
                    {dictionary.records.columns.amount}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">{dictionary.records.columns.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                      {record.recordDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-950">{record.title}</td>
                    <td className="px-4 py-3 text-zinc-600">{categoryLabel(record.category)}</td>
                    <td className="px-4 py-3 text-zinc-600">{record.paymentSource.name}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {dictionary.records.scopes[record.scope]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-zinc-950">
                      {formatAmount(Number(record.amount))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <RecordRowActions
                        categories={categoryOptions}
                        dict={rowActionsDict}
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
