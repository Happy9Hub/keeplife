import type { Dictionary } from "@/lib/get-dictionary";

type HeroSectionProps = {
  dictionary: Dictionary["landing"]["hero"];
};

export function HeroSection({ dictionary }: HeroSectionProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-6xl font-bold tracking-tighter text-foreground sm:text-7xl">
          {dictionary.title}
        </h1>
        <p className="mt-6 text-xl leading-8 text-muted-foreground sm:text-2xl">
          {dictionary.slogan}
        </p>
      </div>
    </section>
  );
}
