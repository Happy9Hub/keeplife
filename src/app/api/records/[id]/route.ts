import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createRecordSchema } from "@/features/records/schemas/record.schema";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// Returns a NextResponse on failure, or the resolved household context on success.
async function requireOwnedRecord(
  request: Request,
  recordId: string,
): Promise<NextResponse | { householdId: string }> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  const householdId = session?.user?.activeHouseholdId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!householdId) {
    return NextResponse.json({ error: "No active household." }, { status: 400 });
  }

  // Scope by household — a user can only touch records in their active household.
  const record = await prisma.record.findFirst({
    where: { id: recordId, householdId },
    select: { id: true },
  });

  if (!record) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  return { householdId };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const owned = await requireOwnedRecord(request, id);

    if (owned instanceof NextResponse) {
      return owned;
    }

    const { householdId } = owned;

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

    // The category and payment source must both belong to the household.
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

    await prisma.record.update({
      where: { id },
      data: {
        title,
        amount,
        type,
        scope,
        recordDate: new Date(`${recordDate}T00:00:00.000Z`),
        categoryId,
        paymentSourceId,
      },
    });

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Update record failed:", error);

    return NextResponse.json({ error: "Unable to update record." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const owned = await requireOwnedRecord(request, id);

    if (owned instanceof NextResponse) {
      return owned;
    }

    await prisma.record.delete({ where: { id } });

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Delete record failed:", error);

    return NextResponse.json({ error: "Unable to delete record." }, { status: 500 });
  }
}
