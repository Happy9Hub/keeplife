"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createReminderSchema,
  REMINDER_TYPES,
  type CreateReminderValues,
  type ReminderTypeValue,
} from "@/features/reminders/schemas/reminder.schema";

export type ReminderFormDictionary = {
  title: string;
  titlePlaceholder: string;
  type: string;
  dueDate: string;
  isRecurring: string;
  intervalMonths: string;
  intervalMonthsPlaceholder: string;
  submit: string;
  submitting: string;
  errorMessage: string;
  duplicate: string;
  types: Record<ReminderTypeValue, string>;
};

type ReminderFormProps = {
  dict: ReminderFormDictionary;
  onSuccess: () => void;
  // When set, edits that reminder via PATCH instead of creating via POST.
  reminderId?: string;
  initialValues?: CreateReminderValues;
  submitLabel?: string;
  // Source record when creating via the "Create reminder" shortcut on a record.
  recordId?: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ReminderForm({
  dict,
  onSuccess,
  reminderId,
  initialValues,
  submitLabel,
  recordId,
}: ReminderFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CreateReminderValues>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: initialValues ?? {
      title: "",
      type: "bill",
      dueDate: todayIso(),
      isRecurring: false,
      intervalMonths: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const isRecurring = useWatch({ control: form.control, name: "isRecurring" });

  async function onSubmit(values: CreateReminderValues) {
    setErrorMessage(null);

    try {
      const body = !reminderId && recordId ? { ...values, recordId } : values;
      const response = await fetch(
        reminderId ? `/api/reminders/${reminderId}` : "/api/reminders",
        {
          method: reminderId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          setErrorMessage(dict.duplicate);
          return;
        }

        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setErrorMessage(errorBody?.error ?? dict.errorMessage);
        return;
      }

      onSuccess();
    } catch {
      setErrorMessage(dict.errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.title}</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder={dict.titlePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.type}</FormLabel>
                <FormControl>
                  <Select disabled={isSubmitting} {...field}>
                    {REMINDER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {dict.types[type]}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.dueDate}</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  checked={field.value}
                  className="h-4 w-4 rounded border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  disabled={isSubmitting}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.checked)}
                  ref={field.ref}
                  type="checkbox"
                />
                {dict.isRecurring}
              </label>
            </FormItem>
          )}
        />

        {isRecurring ? (
          <FormField
            control={form.control}
            name="intervalMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.intervalMonths}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    inputMode="numeric"
                    placeholder={dict.intervalMonthsPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? dict.submitting : (submitLabel ?? dict.submit)}
        </Button>

        {errorMessage ? (
          <p className="text-center text-sm font-medium text-destructive">{errorMessage}</p>
        ) : null}
      </form>
    </Form>
  );
}
