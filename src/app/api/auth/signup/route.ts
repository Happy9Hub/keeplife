import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

type SignupBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  householdName?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: SignupBody;

    try {
      body = (await request.json()) as SignupBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const name = normalizeString(body.name);
    const email = normalizeString(body.email)?.toLowerCase();
    const password = normalizeString(body.password);
    const householdName = normalizeString(body.householdName);

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      if (householdName) {
        const household = await tx.household.findFirst({
          where: { name: householdName },
          select: { id: true },
        });

        if (!household) {
          throw new SignupError("Household not found.", 400);
        }

        return tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: "member",
            householdId: household.id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            householdId: true,
          },
        });
      }

      const household = await tx.household.create({
        data: {
          name: `${name}'s Household`,
        },
        select: { id: true },
      });

      return tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "admin",
          householdId: household.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          householdId: true,
        },
      });
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof SignupError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (isDuplicateEmailError(error)) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    console.error("Signup failed:", error);

    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function isDuplicateEmailError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

class SignupError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
