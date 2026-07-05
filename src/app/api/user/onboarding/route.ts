import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type OnboardingBody = {
  name?: unknown;
  householdName?: unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleOnboarding(request);
}

export async function PATCH(request: Request) {
  return handleOnboarding(request);
}

async function handleOnboarding(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: OnboardingBody;

    try {
      body = (await request.json()) as OnboardingBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const name = normalizeString(body.name);
    const householdName = normalizeString(body.householdName);

    if (!name || !householdName) {
      return NextResponse.json(
        { error: "Name and household name are required." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const household = await tx.household.create({
        data: {
          name: householdName,
        },
        select: {
          id: true,
          name: true,
        },
      });

      const membership = await tx.householdMember.create({
        data: {
          userId,
          householdId: household.id,
          role: "ADMIN",
        },
        select: {
          id: true,
          role: true,
        },
      });

      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          activeHouseholdId: household.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          activeHouseholdId: true,
        },
      });

      return {
        household,
        membership,
        user,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Onboarding failed:", error);

    return NextResponse.json(
      { error: "Unable to complete onboarding." },
      { status: 500 },
    );
  }
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}
