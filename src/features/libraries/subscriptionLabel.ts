import type { Dashboard } from "@/api/types";

/** "Free trial · 9 days left", "Plan · 40 days left", "Subscription ended" (REVIEW FU5). */
export function subscriptionLabel(s: Dashboard["subscription"]): { text: string; urgent: boolean } {
  if (!s.usable) return { text: "Subscription ended", urgent: true };
  const days = `${s.daysRemaining} day${s.daysRemaining === 1 ? "" : "s"} left`;
  if (s.status === "TRIALING") return { text: `Free trial · ${days}`, urgent: s.daysRemaining <= 3 };
  return { text: `Plan · ${days}`, urgent: s.daysRemaining <= 7 };
}
