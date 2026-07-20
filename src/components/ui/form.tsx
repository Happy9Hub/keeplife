"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";

export const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const { formState, getFieldState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>.");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    name: fieldContext.name,
    error: fieldState.error,
  };
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { name, error } = useFormField();

  return (
    <label
      className={cn("block w-full text-left text-sm font-medium text-foreground", error && "text-destructive", className)}
      htmlFor={name}
      {...props}
    />
  );
}

export function FormControl({ children }: { children: React.ReactElement<{ id?: string }> }) {
  const { name } = useFormField();

  return React.cloneElement(children, { id: name });
}

export function FormMessage({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useFormField();

  if (!error?.message) {
    return null;
  }

  return (
    <p className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {String(error.message)}
    </p>
  );
}
