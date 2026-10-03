import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOrganizationAction, type OrganizationAction } from "../../api/admin";
import { ApiError } from "../../api/client";
import { Button, Field, Input, Textarea } from "../../components/ui";

export type ActionSpec = {
  action: OrganizationAction;
  /** Button and dialog title, e.g. "Suspend account". */
  label: string;
  /** Shown after it worked, e.g. "Account suspended." */
  done: string;
  /** What will happen, in plain words, before the admin confirms. */
  consequence: string;
  danger?: boolean;
  /** Extend trial asks for a number of days. */
  askDays?: boolean;
};

const schema = z.object({
  reason: z.string().trim().min(3, "Write why, in a few words. It goes in the audit log."),
  days: z.coerce.number().int().min(1, "At least 1 day").max(60, "At most 60 days").optional(),
});
type Values = z.input<typeof schema>;

/**
 * Every account action goes through this dialog: it says what will happen, asks for a
 * reason (stored in the audit log) and shows the server's answer if it refuses.
 */
export function ActionDialog({ orgId, spec, onDone }: { orgId: number; spec: ActionSpec; onDone: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const mutation = useOrganizationAction(orgId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { reason: "", days: spec.askDays ? 7 : undefined } });

  const submit = handleSubmit(async (values) => {
    const parsed = schema.parse(values);
    await mutation.mutateAsync({ action: spec.action, body: { reason: parsed.reason, ...(spec.askDays ? { days: parsed.days } : {}) } });
    setOpen(false);
    reset();
    onDone(spec.done);
  });

  const serverError = mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? "That didn't work. Try again." : null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          mutation.reset();
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant={spec.danger ? "danger" : "secondary"}>{spec.label}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-6 shadow-lg">
          <Dialog.Title className="font-display text-lg font-semibold">{spec.label}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-quiet">{spec.consequence}</Dialog.Description>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            {spec.askDays && (
              <Field label="Days to add" htmlFor="days" error={errors.days?.message}>
                <Input id="days" type="number" min={1} max={60} className="w-28" aria-invalid={!!errors.days} {...register("days")} />
              </Field>
            )}
            <Field label="Reason" htmlFor="reason" error={errors.reason?.message} hint="Saved in the audit log with your name.">
              <Textarea id="reason" aria-invalid={!!errors.reason} {...register("reason")} />
            </Field>

            {serverError && (
              <p className="rounded-md bg-critical-soft px-3 py-2 text-sm text-critical" role="alert">
                {serverError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant={spec.danger ? "danger" : "primary"} disabled={mutation.isPending}>
                {mutation.isPending ? "Working…" : spec.label}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
