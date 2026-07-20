"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
  createRecordSchema,
  EXPENSE_SCOPES,
  RECORD_TYPES,
  type CreateRecordValues,
  type ExpenseScopeValue,
  type RecordTypeValue,
} from "@/features/records/schemas/record.schema";

export type CategoryOption = {
  id: string;
  label: string;
};

export type RecordFormDictionary = {
  title: string;
  titlePlaceholder: string;
  amount: string;
  amountPlaceholder: string;
  category: string;
  paymentSource: string;
  type: string;
  scope: string;
  date: string;
  submit: string;
  submitting: string;
  errorMessage: string;
  noCategories: string;
  noPaymentSources: string;
  types: Record<RecordTypeValue, string>;
  scopes: Record<ExpenseScopeValue, string>;
};

type RecordFormProps = {
  categories: CategoryOption[];
  paymentSources: CategoryOption[];
  dict: RecordFormDictionary;
  onSuccess: () => void;
  // When set, the form edits that record via PATCH instead of creating via POST.
  recordId?: string;
  initialValues?: CreateRecordValues;
  submitLabel?: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function RecordForm({
  categories,
  paymentSources,
  dict,
  onSuccess,
  recordId,
  initialValues,
  submitLabel,
}: RecordFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CreateRecordValues>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: initialValues ?? {
      title: "",
      amount: "",
      categoryId: categories[0]?.id ?? "",
      paymentSourceId: paymentSources[0]?.id ?? "",
      type: "expense",
      scope: "PRIVATE",
      recordDate: todayIso(),
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">{dict.noCategories}</p>;
  }

  if (paymentSources.length === 0) {
    return <p className="text-sm text-muted-foreground">{dict.noPaymentSources}</p>;
  }

  async function onSubmit(values: CreateRecordValues) {
    setErrorMessage(null);

    try {
      const response = await fetch(
        recordId ? `/api/records/${recordId}` : "/api/records",
        {
          method: recordId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(body?.error ?? dict.errorMessage);
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

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.amount}</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  inputMode="decimal"
                  placeholder={dict.amountPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.category}</FormLabel>
              <FormControl>
                <Select disabled={isSubmitting} {...field}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
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
          name="paymentSourceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.paymentSource}</FormLabel>
              <FormControl>
                <Select disabled={isSubmitting} {...field}>
                  {paymentSources.map((paymentSource) => (
                    <option key={paymentSource.id} value={paymentSource.id}>
                      {paymentSource.label}
                    </option>
                  ))}
                </Select>
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
                    {RECORD_TYPES.map((type) => (
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
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.scope}</FormLabel>
                <FormControl>
                  <Select disabled={isSubmitting} {...field}>
                    {EXPENSE_SCOPES.map((scope) => (
                      <option key={scope} value={scope}>
                        {dict.scopes[scope]}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="recordDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.date}</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
