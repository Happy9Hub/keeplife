# Dictionaries Feature

KeepLife uses a lightweight dictionary system to support English and Thai without adding a large i18n library.

## Goal

The feature lets pages render translated text based on the locale in the URL:

- `/en` loads English text
- `/th` loads Thai text

The current implementation is intentionally simple and server-friendly. It uses JSON files and a small TypeScript utility.

## Key Files

### `dictionaries/en.json`

Stores English copy.

```json
{
  "signIn": "Sign In",
  "signUp": "Sign Up",
  "email": "Email",
  "password": "Password",
  "welcome": "Welcome",
  "landing": {
    "nav": {
      "logo": "KeepLife"
    },
    "hero": {
      "title": "KeepLife",
      "slogan": "Your home, payments, and reminders in one calm place."
    }
  }
}
```

### `dictionaries/th.json`

Stores Thai copy with the same key structure as English.

The keys must match `en.json`. Only the values should change.

### `src/lib/get-dictionary.ts`

Loads the correct JSON dictionary.

```ts
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
```

This function receives a locale, then dynamically imports the matching JSON file.

### `src/lib/i18n.ts`

Defines which locales are supported.

```ts
export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];
```

This prevents random unsupported locale strings from being treated as valid languages.

## Dictionary Key Structure

Top-level keys are shared app words:

| Key | Purpose |
| --- | --- |
| `signIn` | Text for sign-in buttons |
| `signUp` | Text for sign-up buttons |
| `email` | Email field label |
| `password` | Password field label |
| `welcome` | Generic welcome text |

Nested keys are grouped by feature or page:

```txt
landing.nav.logo
landing.hero.title
landing.hero.slogan
```

This structure is useful because future features can add their own groups:

```txt
dashboard.title
records.addRecord
settings.language
```

## Request Flow

Example URL:

```txt
/th
```

Flow:

```txt
User visits /th
  |
  v
Next.js reads [locale] route param
  |
  v
src/app/[locale]/page.tsx validates locale
  |
  v
getDictionary("th") loads dictionaries/th.json
  |
  v
Page passes dictionary text into components
  |
  v
Navbar, AuthButtons, and HeroSection render Thai text
```

## Component Flow

### Landing Page

`src/app/[locale]/page.tsx` loads the dictionary:

```tsx
const dictionary = await getDictionary(locale);
```

Then passes it into components:

```tsx
<Navbar dictionary={dictionary} locale={locale} />
<HeroSection dictionary={dictionary.landing.hero} />
```

### Navbar

`Navbar` uses:

```tsx
dictionary.landing.nav.logo
```

It also passes the full dictionary to `AuthButtons`.

### AuthButtons

`AuthButtons` uses top-level auth keys:

```tsx
dictionary.signIn
dictionary.signUp
```

### HeroSection

`HeroSection` uses:

```tsx
dictionary.title
dictionary.slogan
```

The page passes only `dictionary.landing.hero`, so the component does not need to know about the full app dictionary.

## Language Switching Flow

`LanguageSwitcher` receives the current locale:

```tsx
<LanguageSwitcher locale={locale} />
```

If the current locale is `en`, it shows `TH`.

If the current locale is `th`, it shows `EN`.

When clicked, it replaces the first URL segment:

```txt
/en -> /th
/th -> /en
```

This keeps language state in the URL instead of hidden React state.

## Why This Design

Benefits:

- No heavy external i18n dependency
- Easy for beginners to understand
- Works naturally with App Router server components
- Keeps translations outside component files
- Prepares the app for future features like dashboard, records, settings, and auth pages

Tradeoff:

- No advanced pluralization or locale formatting yet
- Every dictionary file must keep the same key structure manually

For KeepLife V1, this is a good fit because the app only needs simple TH/EN labels and page copy.
