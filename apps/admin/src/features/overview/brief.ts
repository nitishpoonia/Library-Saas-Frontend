import type { Overview } from "../../api/types";
import { formatCalendarDate, formatPaise, formatTime, plural, todayInIndia } from "../../lib/format";

export type BriefLine = {
  text: string;
  /** "attention" lines are what needs looking at today. */
  tone: "normal" | "attention" | "problem";
  /** Where to look next. */
  link?: string;
};

/**
 * The overview's opening: the state of the service written as a few plain sentences,
 * problems first, so a glance says whether anything needs doing today.
 */
export function buildBrief(o: Overview, now = new Date()): BriefLine[] {
  const problems: BriefLine[] = [];
  const lines: BriefLine[] = [];

  const run = o.ops.lastDailyRun;
  const today = todayInIndia(now);
  if (!run) {
    problems.push({ text: "The daily job hasn't run yet.", tone: "attention", link: "/ops" });
  } else if (run.status === "FAILED") {
    problems.push({
      text: `The daily job failed on ${formatCalendarDate(run.runDate)}${run.error ? `: ${run.error}` : "."}`,
      tone: "problem",
      link: "/ops",
    });
  } else if (run.runDate.slice(0, 10) !== today) {
    problems.push({
      text: `The daily job hasn't run today. It last ran on ${formatCalendarDate(run.runDate)}.`,
      tone: "attention",
      link: "/ops",
    });
  } else if (run.status === "RUNNING") {
    lines.push({ text: "Today's daily job is running.", tone: "normal", link: "/ops" });
  } else {
    lines.push({
      text: `Today's daily job ran${run.finishedAt ? ` at ${formatTime(run.finishedAt)}` : ""} without errors.`,
      tone: "normal",
      link: "/ops",
    });
  }

  if (o.ops.failedNoticesLast7Days > 0) {
    problems.push({
      text: `${plural(o.ops.failedNoticesLast7Days, "text")} to students failed this week.`,
      tone: "attention",
      link: "/ops",
    });
  }

  const signups = o.organizations.signupsLast7Days;
  lines.unshift({
    text: signups === 0 ? "No new libraries signed up this week." : `${plural(signups, "new library", "new libraries")} signed up this week.`,
    tone: "normal",
    link: "/accounts",
  });

  const paid = o.organizations.byStatus.ACTIVE ?? 0;
  const trialing = o.organizations.byStatus.TRIALING ?? 0;
  lines.splice(1, 0, {
    text:
      paid === 0
        ? `No one is on a paid plan yet; ${plural(trialing, "account is", "accounts are")} on a free trial.`
        : `${plural(paid, "account is", "accounts are")} on a paid plan, worth ${formatPaise(o.revenue.mrrPaise)} a month, and ${plural(trialing, "is", "are")} on a free trial.`,
    tone: "normal",
    link: "/accounts",
  });

  if (o.organizations.suspended > 0) {
    lines.push({ text: `${plural(o.organizations.suspended, "account is", "accounts are")} suspended.`, tone: "normal", link: "/accounts?suspended=true" });
  }

  return [...problems, ...lines];
}
