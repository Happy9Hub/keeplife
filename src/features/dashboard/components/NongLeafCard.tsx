import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MASCOT_NAME } from "@/constants/brand";

export type NongLeafDictionary = {
  insight: string;
  chips: { plan: string; details: string; remindBills: string };
  askPlaceholder: string;
};

export function NongLeafCard({ dict }: { dict: NongLeafDictionary }) {
  const chips = [dict.chips.plan, dict.chips.details, dict.chips.remindBills];

  return (
    <section className="rounded-[var(--radius)] bg-accent p-6 text-accent-foreground">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          🌿
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm font-semibold">{MASCOT_NAME}</p>
            <p className="mt-1 text-sm leading-6">{dict.insight}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-sm transition-colors hover:bg-white/70"
                key={chip}
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Stub — asking the assistant isn't wired up yet. */}
          <div className="flex items-center gap-2">
            <Input
              className="bg-white"
              disabled
              placeholder={dict.askPlaceholder}
            />
            <Button aria-label={dict.askPlaceholder} disabled size="icon" type="button">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
