import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createReminderSchema,
  reminderStatusSchema,
} from "@/features/reminders/schemas/reminder.schema";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// Returns a NextResponse on failure, or resolves successfully when the reminder
// belongs to the caller's active household.
async function requireOwnedReminder(
  request: Request,
  reminderId: string,
): Promise<NextResponse | { ok: true }> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  const householdId = session?.user?.activeHouseholdId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!householdId) {
    return NextResponse.json({ error: "No active household." }, { status: 400 });
  }

  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, householdId },
    select: { id: true },
  });

  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
  }

  return { ok: true };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const owned = await requireOwnedReminder(request, id);

    if (owned instanceof NextResponse) {
      return owned;
    }

    let json: unknown;

    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    // A status-only body is a quick action (Mark done / Dismiss); anything with a
    // title is a full edit.
    const isStatusOnly =
      typeof json === "object" &&
      json !== null &&
      "status" in json &&
      !("title" in json);

    if (isStatusOnly) {
      const parsed = reminderStatusSchema.safeParse(json);

      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }

      await prisma.reminder.update({
        where: { id },
        data: { status: parsed.data.status },
      });

      return NextResponse.json({ id }, { status: 200 });
    }

    const parsed = createReminderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reminder data." }, { status: 400 });
    }

    const { title, type, dueDate, isRecurring, intervalMonths } = parsed.data;

    await prisma.reminder.update({
      where: { id },
      data: {
        title,
        type,
        dueDate: new Date(`${dueDate}T00:00:00.000Z`),
        isRecurring,
        intervalMonths: isRecurring ? Number(intervalMonths) : null,
      },
    });

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Update reminder failed:", error);

    return NextResponse.json({ error: "Unable to update reminder." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const owned = await requireOwnedReminder(request, id);

    if (owned instanceof NextResponse) {
      return owned;
    }

    await prisma.reminder.delete({ where: { id } });

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Delete reminder failed:", error);

    return NextResponse.json({ error: "Unable to delete reminder." }, { status: 500 });
  }
}
