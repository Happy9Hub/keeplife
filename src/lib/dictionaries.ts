import type { Locale } from "@/lib/i18n";

const dictionaries = {
  en: {
    landing: {
      nav: {
        logo: "KeepLife",
      },
      hero: {
        title: "KeepLife",
        slogan: "Your home, payments, and reminders in one calm place.",
      },
      auth: {
        signIn: "Sign In",
        signUp: "Sign Up",
      },
    },
  },
  th: {
    landing: {
      nav: {
        logo: "KeepLife",
      },
      hero: {
        title: "KeepLife",
        slogan: "ดูแลบ้าน ค่าใช้จ่าย และการแจ้งเตือนของครอบครัวในที่เดียว",
      },
      auth: {
        signIn: "เข้าสู่ระบบ",
        signUp: "สมัครใช้งาน",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
