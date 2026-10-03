import clsx from "clsx";
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import type { SubscriptionStatus } from "../api/types";
import { ApiError } from "../api/client";
import { STATUS_LABEL } from "../lib/format";

// ─── Buttons and fields ─────────────────────────────────────────────────────

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" };

export function Button({ variant = "secondary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium whitespace-nowrap",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand text-white hover:bg-brand-strong",
        variant === "secondary" && "border border-line bg-surface text-ink hover:bg-paper",
        variant === "danger" && "bg-critical text-white hover:brightness-95",
        variant === "ghost" && "text-quiet hover:bg-surface hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}

const fieldClass =
  "rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-quiet/70 aria-[invalid=true]:border-critical";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={clsx(fieldClass, "h-9 w-full", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={clsx(fieldClass, "min-h-20 w-full py-2", className)} {...props} />;
});

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(fieldClass, "h-9 pr-8", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-critical" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-quiet">{hint}</p>
      ) : null}
    </div>
  );
}

// ─── Status ─────────────────────────────────────────────────────────────────

const toneClass = {
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  critical: "bg-critical-soft text-critical",
  brand: "bg-brand-soft text-brand-strong",
  muted: "bg-paper text-quiet border border-line",
} as const;

export type Tone = keyof typeof toneClass;

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", toneClass[tone])}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<SubscriptionStatus, Tone> = {
  TRIALING: "brand",
  ACTIVE: "good",
  PAST_DUE: "warn",
  EXPIRED: "critical",
  CANCELLED: "muted",
};

/** An account's state. Suspension outranks the subscription status. */
export function AccountStatus({ status, suspended }: { status: SubscriptionStatus; suspended: boolean }) {
  return (
    <span className="inline-flex gap-1.5">
      <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
      {suspended && <Pill tone="critical">Suspended</Pill>}
    </span>
  );
}

// ─── Tables ─────────────────────────────────────────────────────────────────

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full border-collapse text-sm tabular-nums">{children}</table>
    </div>
  );
}

export function Th({ children, align = "left" }: { children?: ReactNode; align?: "left" | "right" }) {
  return (
    <th
      scope="col"
      className={clsx(
        "border-b border-line px-4 py-2.5 text-xs font-medium text-quiet whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className }: { children?: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <td className={clsx("border-b border-line px-4 py-3 align-top [tr:last-child_&]:border-b-0", align === "right" && "text-right", className)}>
      {children}
    </td>
  );
}

export function Pagination({
  page,
  meta,
  onPage,
}: {
  page: number;
  meta: { total: number; limit: number; totalPages: number; hasNextPage: boolean } | undefined;
  onPage: (page: number) => void;
}) {
  if (!meta || meta.total === 0) return null;
  const from = (page - 1) * meta.limit + 1;
  const to = Math.min(page * meta.limit, meta.total);
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-quiet">
      <span>
        {from}–{to} of {meta.total}
      </span>
      <span className="flex gap-2">
        <Button disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button disabled={!meta.hasNextPage} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </span>
    </div>
  );
}

// ─── Page states ────────────────────────────────────────────────────────────

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-quiet">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <p className="py-10 text-sm text-quiet" role="status">
      {label}…
    </p>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : "Something went wrong loading this page.";
  return (
    <div className="rounded-lg border border-critical/30 bg-critical-soft px-4 py-3 text-sm text-critical" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button className="mt-2 font-medium underline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-quiet">{children}</p>;
}
