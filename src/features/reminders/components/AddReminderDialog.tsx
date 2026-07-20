"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  ReminderForm,
  type ReminderFormDictionary,
} from "@/features/reminders/components/ReminderForm";

type AddReminderDialogProps = {
  dict: {
    add: string;
    form: ReminderFormDictionary;
  };
};

export function AddReminderDialog({ dict }: AddReminderDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button">
        {dict.add}
      </Button>

      <Dialog onOpenChange={setOpen} open={open} title={dict.add}>
        <ReminderForm
          dict={dict.form}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Dialog>
    </>
  );
}
