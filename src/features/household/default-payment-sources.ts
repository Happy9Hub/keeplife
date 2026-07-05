/**
 * Starter payment sources seeded into every new household at onboarding, so a
 * required payment source is always available on the add-record form. Plain
 * names (not bilingual) — payment methods are proper nouns, not translated.
 *
 * Keep this list in sync with the seed block in the `add_payment_source`
 * migration, which backfills the same defaults into pre-existing households.
 */
export const DEFAULT_PAYMENT_SOURCES = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "PromptPay",
  "GrabPay",
  "TrueMoney Wallet",
] as const;
