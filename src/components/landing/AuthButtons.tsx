import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/dictionaries";

type AuthButtonsProps = {
  dictionary: Dictionary["landing"]["auth"];
};

export function AuthButtons({ dictionary }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost">{dictionary.signIn}</Button>
      <Button variant="default">{dictionary.signUp}</Button>
    </div>
  );
}
