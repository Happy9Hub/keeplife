import { z } from "zod";

export const RECORD_TYPES = ["expense", "bill", "subscription", "maintenance"] as const;
export const EXPENSE_SCOPES = ["PRIVATE", "SHARED"] as const;

export type RecordTypeValue = (typeof RECORD_TYPES)[number];
export type ExpenseScopeValue = (typeof EXPENSE_SCOPES)[number];

// `amount` is validated as a string (up to 2 decimals) rather than a number so
// it can be passed straight to Prisma's Decimal column without float rounding.
export const createRecordSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimals).")
    .refine((value) => Number(value) > 0, "Amount must be greater than 0.")
    .refine((value) => Number(value) <= 9_999_999_999.99, "Amount is too large."),
  categoryId: z.string().min(1, "Please choose a category."),
  paymentSourceId: z.string().min(1, "Please choose a payment source."),
  type: z.enum(RECORD_TYPES),
  scope: z.enum(EXPENSE_SCOPES),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick a date."),
});

export type CreateRecordValues = z.infer<typeof createRecordSchema>;
