import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type MissingPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function MissingPage({ params }: MissingPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const isThai = lang === "th";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <section className="mx-auto max-w-md space-y-4">
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          {isThai ? "ยังไม่มีหน้านี้" : "This page does not exist yet"}
        </h1>
        <p className="text-sm leading-6 text-zinc-500">
          {isThai
            ? "ฟีเจอร์นี้อาจยังอยู่ระหว่างพัฒนา กลับไปหน้าแรกก่อนนะ"
            : "This feature may still be in progress. Head back to the landing page for now."}
        </p>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          href={`/${lang}`}
        >
          {isThai ? "กลับหน้าแรก" : "Back home"}
        </Link>
      </section>
    </main>
  );
}
