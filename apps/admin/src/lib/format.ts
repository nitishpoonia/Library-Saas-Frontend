import type { SubscriptionStatus } from "../api/types";

/** Formatting for India: rupees with Indian digit grouping, dates in IST. */

export const TIME_ZONE = "Asia/Kolkata";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const wholeRupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** 99900 paise → "₹999"; 83250 → "₹832.50". */
export function formatPaise(paise: number): string {
  const value = paise / 100;
  return Number.isInteger(value) ? wholeRupees.format(value) : rupees.format(value);
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });

export const formatDate = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : "—");
export const formatDateTime = (iso: string | null) => (iso ? dateTimeFormat.format(new Date(iso)) : "—");
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

/** A calendar date (a DATE column, sent as midnight UTC) → "2 Oct 2026", without a timezone shift. */
export const formatCalendarDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );

/** Today's date in IST as "YYYY-MM-DD". */
export const todayInIndia = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);

/** "3 days ago", "in 5 days", "today". */
export function relativeDays(iso: string | null, now = new Date()): string {
  if (!iso) return "never";
  const days = Math.round((new Date(iso).getTime() - now.getTime()) / 86_400_000);
  if (days === 0) return "today";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(days, "day");
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  TRIALING: "Free trial",
  ACTIVE: "Paid",
  PAST_DUE: "Payment due",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

const PLAN_LABEL = { MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly" } as const;

export function describePayment(p: { kind: "PLAN" | "BRANCH_ADDON"; plan: keyof typeof PLAN_LABEL | null; branches: number }) {
  if (p.kind === "BRANCH_ADDON") return "Extra branch";
  return `${p.plan ? PLAN_LABEL[p.plan] : "Plan"}, ${plural(p.branches, "branch", "branches")}`;
}

/** "organization.extend_trial" → "Extended trial". */
export const ACTION_LABEL: Record<string, string> = {
  "auth.login": "Logged in",
  "organization.extend_trial": "Extended trial",
  "organization.suspend": "Suspended account",
  "organization.unsuspend": "Restored account",
  "organization.revoke_sessions": "Logged owner out everywhere",
};
