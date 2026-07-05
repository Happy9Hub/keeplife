import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createRecordSchema } from "@/features/records/schemas/record.schema";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const userId = session?.user?.id;
    const householdId = session?.user?.activeHouseholdId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!householdId) {
      return NextResponse.json({ error: "No active household." }, { status: 400 });
    }

    let json: unknown;

    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = createRecordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid record data." }, { status: 400 });
    }

    const { title, amount, categoryId, paymentSourceId, type, scope, recordDate } =
      parsed.data;

    // The category and payment source must both belong to the user's active
    // household — never trust the client to reference another household's rows.
    const [category, paymentSource] = await Promise.all([
      prisma.category.findFirst({
        where: { id: categoryId, householdId },
        select: { id: true },
      }),
      prisma.paymentSource.findFirst({
        where: { id: paymentSourceId, householdId },
        select: { id: true },
      }),
    ]);

    if (!category) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if (!paymentSource) {
      return NextResponse.json({ error: "Invalid payment source." }, { status: 400 });
    }

    const record = await prisma.record.create({
      data: {
        title,
        amount,
        type,
        scope,
        // Parse as UTC midnight so the calendar date round-trips regardless of
        // server timezone (the page renders it back via toISOString()).
        recordDate: new Date(`${recordDate}T00:00:00.000Z`),
        userId,
        householdId,
        categoryId,
        paymentSourceId,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (error) {
    console.error("Create record failed:", error);

    return NextResponse.json(
      { error: "Unable to create record." },
      { status: 500 },
    );
  }
}
