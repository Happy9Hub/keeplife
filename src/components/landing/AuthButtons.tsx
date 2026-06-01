import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/get-dictionary";

type AuthButtonsProps = {
  dictionary: Dictionary;
};

export function AuthButtons({ dictionary }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost">{dictionary.signIn}</Button>
      <Button variant="default">{dictionary.signUp}</Button>
    </div>
  );
}
