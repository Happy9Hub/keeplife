import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createReminderSchema } from "@/features/reminders/schemas/reminder.schema";
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

    const parsed = createReminderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reminder data." }, { status: 400 });
    }

    const { title, type, dueDate, isRecurring, intervalMonths } = parsed.data;

    // Optional link back to the source record (create-from-record shortcut).
    const rawRecordId =
      typeof json === "object" && json !== null && "recordId" in json
        ? (json as { recordId?: unknown }).recordId
        : undefined;
    let recordId: string | null = null;

    if (typeof rawRecordId === "string" && rawRecordId.length > 0) {
      const record = await prisma.record.findFirst({
        where: { id: rawRecordId, householdId },
        select: { id: true },
      });

      if (!record) {
        return NextResponse.json({ error: "Invalid record." }, { status: 400 });
      }

      // One pending reminder per record — don't create duplicates.
      const existing = await prisma.reminder.findFirst({
        where: { recordId: record.id, status: "pending" },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A reminder already exists for this expense." },
          { status: 409 },
        );
      }

      recordId = record.id;
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        type,
        // Parse as UTC midnight so the calendar date round-trips regardless of
        // server timezone (the page renders it back via toISOString()).
        dueDate: new Date(`${dueDate}T00:00:00.000Z`),
        isRecurring,
        intervalMonths: isRecurring ? Number(intervalMonths) : null,
        userId,
        householdId,
        recordId,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: reminder.id }, { status: 201 });
  } catch (error) {
    console.error("Create reminder failed:", error);

    return NextResponse.json(
      { error: "Unable to create reminder." },
      { status: 500 },
    );
  }
}
