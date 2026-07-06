"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RecordForm,
  type CategoryOption,
  type RecordFormDictionary,
} from "@/features/records/components/RecordForm";
import type {
  CreateRecordValues,
  RecordTypeValue,
} from "@/features/records/schemas/record.schema";
import {
  ReminderForm,
  type ReminderFormDictionary,
} from "@/features/reminders/components/ReminderForm";
import type { ReminderTypeValue } from "@/features/reminders/schemas/reminder.schema";

// Record types don't all map to reminder types; "expense" has no equivalent.
const RECORD_TO_REMINDER_TYPE: Record<RecordTypeValue, ReminderTypeValue> = {
  bill: "bill",
  subscription: "subscription",
  maintenance: "maintenance",
  expense: "bill",
};

function addOneMonth(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export type RecordRowActionsDictionary = {
  edit: string;
  delete: string;
  createReminder: string;
  actions: string;
  editExpense: string;
  deleteTitle: string;
  deleteConfirm: string;
  deleting: string;
  deleteError: string;
  cancel: string;
  saveChanges: string;
  reminderSet: string;
  form: RecordFormDictionary;
  reminderForm: ReminderFormDictionary;
};

type RecordRowActionsProps = {
  recordId: string;
  values: CreateRecordValues;
  categories: CategoryOption[];
  paymentSources: CategoryOption[];
  hasReminder: boolean;
  dict: RecordRowActionsDictionary;
};

export function RecordRowActions({
  recordId,
  values,
  categories,
  paymentSources,
  hasReminder,
  dict,
}: RecordRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
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
    <div className="flex items-center justify-end gap-1">
      {hasReminder ? (
        <span aria-label={dict.reminderSet} title={dict.reminderSet}>
          <Bell aria-hidden="true" className="h-4 w-4 text-zinc-400" />
        </span>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={dict.actions}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            {dict.edit}
          </DropdownMenuItem>
          {hasReminder ? null : (
            <DropdownMenuItem onClick={() => setReminderOpen(true)}>
              {dict.createReminder}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            {dict.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <Dialog
        onOpenChange={setReminderOpen}
        open={reminderOpen}
        title={dict.createReminder}
      >
        <ReminderForm
          dict={dict.reminderForm}
          initialValues={{
            title: values.title,
            type: RECORD_TO_REMINDER_TYPE[values.type],
            dueDate: addOneMonth(values.recordDate),
            isRecurring: false,
            intervalMonths: "",
          }}
          onSuccess={() => {
            setReminderOpen(false);
            router.refresh();
          }}
          recordId={recordId}
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
