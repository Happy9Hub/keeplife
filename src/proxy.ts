import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "@/lib/i18n";

const publicRouteSegments = new Set(["", "signup", "signin"]);

type BetterAuthSessionResponse = {
  user?: {
    activeHouseholdId?: string | null;
  } | null;
} | null;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathnameWithoutLocale } = getLocalePath(pathname);

  if (!locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const firstRouteSegment = pathnameWithoutLocale.split("/").filter(Boolean)[0] ?? "";
  const isPublicRoute = publicRouteSegments.has(firstRouteSegment);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  const isLoggedIn = Boolean(session?.user);
  const activeHouseholdId = session?.user?.activeHouseholdId;
  const isMissingHousehold = activeHouseholdId == null || activeHouseholdId === "";
  const isOnboardingRoute =
    pathnameWithoutLocale === "/onboarding" ||
    pathnameWithoutLocale.startsWith("/onboarding/");

  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/signin`;
    return NextResponse.redirect(url);
  }

  if (isOnboardingRoute && !isMissingHousehold) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  if (!isOnboardingRoute && isMissingHousehold) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/onboarding`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

async function getSession(request: NextRequest) {
  const sessionUrl = new URL("/api/auth/get-session", request.url);

  try {
    const response = await fetch(sessionUrl, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as BetterAuthSessionResponse;
  } catch {
    return null;
  }
}

function getLocalePath(pathname: string) {
  const pathSegments = pathname.split("/");
  const maybeLocale = pathSegments[1];

  if (!locales.includes(maybeLocale as (typeof locales)[number])) {
    return {
      locale: null,
      pathnameWithoutLocale: pathname,
    };
  }

  return {
    locale: maybeLocale,
    pathnameWithoutLocale: `/${pathSegments.slice(2).join("/")}`.replace(/\/$/, "") || "/",
  };
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
