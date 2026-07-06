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
