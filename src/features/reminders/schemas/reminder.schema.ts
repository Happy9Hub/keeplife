import { z } from "zod";

export const REMINDER_TYPES = ["maintenance", "passport", "bill", "subscription"] as const;
export const REMINDER_STATUSES = ["pending", "completed", "dismissed"] as const;

export type ReminderTypeValue = (typeof REMINDER_TYPES)[number];
export type ReminderStatusValue = (typeof REMINDER_STATUSES)[number];

// `intervalMonths` is a string (like the record `amount`) so it maps cleanly to a
// text input; it's only required/parsed when the reminder is recurring.
export const createReminderSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
    type: z.enum(REMINDER_TYPES),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick a date."),
    isRecurring: z.boolean(),
    intervalMonths: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.isRecurring) {
      return;
    }

    if (!/^\d+$/.test(value.intervalMonths.trim()) || Number(value.intervalMonths) < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["intervalMonths"],
        message: "Enter a whole number of months (1 or more).",
      });
    }
  });

export type CreateReminderValues = z.infer<typeof createReminderSchema>;

export const reminderStatusSchema = z.object({
  status: z.enum(REMINDER_STATUSES),
});
