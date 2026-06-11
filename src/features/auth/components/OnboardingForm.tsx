"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";

const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  householdName: z
    .string()
    .trim()
    .min(2, "Household name must be at least 2 characters."),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

type OnboardingFormDictionary = {
  name: string;
  householdName: string;
  namePlaceholder?: string;
  householdNamePlaceholder?: string;
  completeSetup: string;
  submitting?: string;
  errorMessage?: string;
};

type OnboardingFormProps = {
  dict: OnboardingFormDictionary;
  lang: Locale;
};

export function OnboardingForm({ dict, lang }: OnboardingFormProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      householdName: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting || isRedirecting;

  async function onSubmit(values: OnboardingFormValues) {
    setStatusMessage(null);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatusMessage(body?.error ?? dict.errorMessage ?? "Unable to complete setup.");
        return;
      }

      setIsRedirecting(true);
      router.push(`/${lang}/dashboard`);
    } catch {
      setIsRedirecting(false);
      setStatusMessage(dict.errorMessage ?? "Unable to complete setup.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent>
        <Form {...form}>
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.name}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      disabled={isSubmitting}
                      placeholder={dict.namePlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="householdName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.householdName}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="organization"
                      disabled={isSubmitting}
                      placeholder={dict.householdNamePlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (dict.submitting ?? dict.completeSetup) : dict.completeSetup}
            </Button>

            {statusMessage ? (
              <p className="text-center text-sm font-medium text-red-600">{statusMessage}</p>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
