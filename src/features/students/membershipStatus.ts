import type { Membership } from "@/api/types";
import { formatDate, todayLocal } from "@/lib/format";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

/**
 * One line that tells the owner where a membership stands, following the product
 * rule: ACTIVE -> OVERDUE (seat held for the grace period) -> CANCELLED on day 7.
 */
export function membershipStatus(m: Membership, today = todayLocal()): { label: string; detail: string; tone: Tone } {
  switch (m.status) {
    case "ACTIVE":
      if (m.startDate > today) {
        return { label: "Upcoming", detail: `Starts ${formatDate(m.startDate, false)}`, tone: "info" };
      }
      return {
        label: m.daysRemaining <= 7 ? `${m.daysRemaining} day${m.daysRemaining === 1 ? "" : "s"} left` : "Active",
        detail: `Till ${formatDate(m.endDate, false)}`,
        tone: m.daysRemaining <= 7 ? "warning" : "success",
      };
    case "OVERDUE": {
      const left = m.graceDaysLeft ?? 0;
      return {
        label: "Overdue",
        detail:
          left <= 1
            ? "Seat released tomorrow unless renewed"
            : `Seat held till ${m.graceEndsOn ? formatDate(m.graceEndsOn, false) : "—"} (${left} days)`,
        tone: "danger",
      };
    }
    case "COMPLETED":
      return { label: "Renewed", detail: `${formatDate(m.startDate, false)} – ${formatDate(m.endDate, false)}`, tone: "neutral" };
    case "CANCELLED":
      return {
        label: m.cancelReason === "REMOVED" ? "Removed" : "Cancelled",
        detail: m.cancelReason === "REMOVED" ? "Student was removed" : "Not renewed in time",
        tone: "neutral",
      };
  }
}
