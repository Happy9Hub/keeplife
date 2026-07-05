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
import type { CreateRecordValues } from "@/features/records/schemas/record.schema";

export type RecordRowActionsDictionary = {
  edit: string;
  delete: string;
  editExpense: string;
  deleteTitle: string;
  deleteConfirm: string;
  deleting: string;
  deleteError: string;
  cancel: string;
  saveChanges: string;
  form: RecordFormDictionary;
};

type RecordRowActionsProps = {
  recordId: string;
  values: CreateRecordValues;
  categories: CategoryOption[];
  paymentSources: CategoryOption[];
  dict: RecordRowActionsDictionary;
};

export function RecordRowActions({
  recordId,
  values,
  categories,
  paymentSources,
  dict,
}: RecordRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/records/${recordId}`, { method: "DELETE" });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setDeleteError(body?.error ?? dict.deleteError);
        setIsDeleting(false);
        return;
      }

      setDeleteOpen(false);
      setIsDeleting(false);
      router.refresh();
    } catch {
      setDeleteError(dict.deleteError);
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        onClick={() => setEditOpen(true)}
        type="button"
      >
        {dict.edit}
      </button>
      <button
        className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
        onClick={() => setDeleteOpen(true)}
        type="button"
      >
        {dict.delete}
      </button>

      <Dialog onOpenChange={setEditOpen} open={editOpen} title={dict.editExpense}>
        <RecordForm
          categories={categories}
          dict={dict.form}
          initialValues={values}
          onSuccess={() => {
            setEditOpen(false);
            router.refresh();
          }}
          paymentSources={paymentSources}
          recordId={recordId}
          submitLabel={dict.saveChanges}
        />
      </Dialog>

      <Dialog onOpenChange={setDeleteOpen} open={deleteOpen} title={dict.deleteTitle}>
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">{dict.deleteConfirm}</p>
          {deleteError ? (
            <p className="text-sm font-medium text-red-600">{deleteError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
              type="button"
              variant="outline"
            >
              {dict.cancel}
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
              variant="destructive"
            >
              {isDeleting ? dict.deleting : dict.delete}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
