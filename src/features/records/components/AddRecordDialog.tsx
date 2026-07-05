"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  RecordForm,
  type CategoryOption,
  type RecordFormDictionary,
} from "@/features/records/components/RecordForm";

type AddRecordDialogProps = {
  categories: CategoryOption[];
  paymentSources: CategoryOption[];
  dict: {
    addExpense: string;
    form: RecordFormDictionary;
  };
};

export function AddRecordDialog({
  categories,
  paymentSources,
  dict,
}: AddRecordDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button">
        {dict.addExpense}
      </Button>

      <Dialog onOpenChange={setOpen} open={open} title={dict.addExpense}>
        <RecordForm
          categories={categories}
          dict={dict.form}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
          paymentSources={paymentSources}
        />
      </Dialog>
    </>
  );
}
