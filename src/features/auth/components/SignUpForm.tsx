"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import {
  signUpSchema,
  type SignUpFormValues,
} from "@/features/auth/schemas/auth.schema";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/lib/i18n";

type SignUpFormDictionary = {
  email: string;
  password: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  continueWithGoogle: string;
  continueWithEmail: string;
  googleUnavailable: string;
  or: string;
  submitting?: string;
  successMessage?: string;
};

type SignUpFormProps = {
  dict: SignUpFormDictionary;
  isGoogleEnabled: boolean;
  lang: Locale;
};

export function SignUpForm({ dict, isGoogleEnabled, lang }: SignUpFormProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting || isTransitioning;

  function handleGoogleSignIn() {
    if (!isGoogleEnabled) {
      setStatusMessage({
        tone: "error",
        text: dict.googleUnavailable,
      });
      return;
    }

    void authClient.signIn.social({
      provider: "google",
      callbackURL: `/${lang}/onboarding`,
      newUserCallbackURL: `/${lang}/onboarding`,
    });
  }

  async function onSubmit(values: SignUpFormValues) {
    setStatusMessage(null);
    const name = values.email.split("@")[0] || values.email;

    try {
      const signUpResult = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name,
      });

      if (signUpResult.error) {
        setStatusMessage({
          tone: "error",
          text: signUpResult.error.message ?? "Unable to create account.",
        });
        return;
      }

      setIsTransitioning(true);
      router.push(`/${lang}/onboarding`);
    } catch {
      setIsTransitioning(false);
      setStatusMessage({
        tone: "error",
        text: "Unable to create account.",
      });
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent className="grid gap-6">
        <Button
          className="w-full gap-2"
          onClick={handleGoogleSignIn}
          type="button"
          variant="outline"
        >
          <GoogleIcon />
          {dict.continueWithGoogle}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">{dict.or}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Form {...form}>
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.email}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      placeholder={dict.emailPlaceholder}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.password}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder={dict.passwordPlaceholder}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (dict.submitting ?? dict.continueWithEmail) : dict.continueWithEmail}
            </Button>

            {statusMessage ? (
              <p
                className={
                  statusMessage.tone === "success"
                    ? "text-center text-sm font-medium text-secondary-foreground"
                    : "text-center text-sm font-medium text-destructive"
                }
              >
                {statusMessage.text}
              </p>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.31 2.98-7.44Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.9a6.01 6.01 0 0 1 0-3.8V7.51H3.06a10 10 0 0 0 0 8.98l3.35-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.98c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.94 5.51l3.35 2.59C7.2 7.74 9.4 5.98 12 5.98Z"
        fill="#EA4335"
      />
    </svg>
  );
}
