import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";

type SignUpPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);
  const isGoogleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher locale={lang} />
      </div>

      <section className="w-full max-w-md text-center">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            {dictionary.auth.signUpTitle}
          </h1>
          <p className="text-sm leading-6 text-zinc-500">{dictionary.auth.signUpSubtitle}</p>
        </div>

        <SignUpForm dict={dictionary.auth} isGoogleEnabled={isGoogleEnabled} lang={lang} />

        <p className="mt-6 text-sm text-zinc-500">
          {dictionary.auth.alreadyHaveAccount}{" "}
          <Link
            className="font-medium text-zinc-950 underline-offset-4 hover:underline"
            href={`/${lang}/signin`}
          >
            {dictionary.auth.signInLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
