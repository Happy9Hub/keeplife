import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n";

type SignInPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function SignInPage({
  params,
  searchParams,
}: SignInPageProps) {
  const { lang } = await params;
  const { callbackUrl } = await searchParams;

  if (!isLocale(lang)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(`/${lang}/dashboard`);
  }

  const dictionary = await getDictionary(lang);
  const resolvedCallbackUrl =
    typeof callbackUrl === "string" ? callbackUrl : `/${lang}/dashboard`;
  const isGoogleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <Link
          className="text-lg font-bold tracking-tight text-foreground transition hover:opacity-80"
          href={`/${lang}`}
        >
          {dictionary.landing.nav.logo}
        </Link>
      </div>
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher locale={lang} />
      </div>

      <section className="w-full max-w-md text-center">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {dictionary.auth.signIn}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">{dictionary.auth.welcome}</p>
        </div>

        <SignInForm
          callbackUrl={resolvedCallbackUrl}
          dict={dictionary.auth}
          isGoogleEnabled={isGoogleEnabled}
        />

        <p className="mt-6 text-sm text-muted-foreground">
          {dictionary.auth.dontHaveAccount}{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={`/${lang}/signup`}
          >
            {dictionary.auth.signUp}
          </Link>
        </p>
      </section>
    </main>
  );
}
