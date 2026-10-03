import { describe, expect, it } from "vitest";
import type { Overview } from "../../api/types";
import { buildBrief } from "./brief";

const NOW = new Date("2026-10-02T06:00:00Z"); // 11:30 IST, 2 Oct

function overview(changes: Partial<{ run: Overview["ops"]["lastDailyRun"]; failed: number; paid: number; trial: number; signups: number; suspended: number }> = {}): Overview {
  return {
    organizations: {
      byStatus: { ACTIVE: changes.paid ?? 3, TRIALING: changes.trial ?? 5 },
      suspended: changes.suspended ?? 0,
      signupsLast7Days: changes.signups ?? 2,
      signupsLast30Days: 9,
    },
    trialConversion: { trialsEnded: 4, paid: 3, rate: 0.75 },
    revenue: { mrrPaise: 299_700, collectedLast30DaysPaise: 299_700 },
    ops: {
      lastDailyRun:
        changes.run === undefined
          ? { runDate: "2026-10-02T00:00:00.000Z", status: "SUCCEEDED", finishedAt: "2026-10-02T03:31:00Z", error: null }
          : changes.run,
      failedNoticesLast7Days: changes.failed ?? 0,
    },
  };
}

describe("overview brief", () => {
  it("reads as plain sentences on a quiet day", () => {
    expect(buildBrief(overview(), NOW).map((l) => l.text)).toEqual([
      "2 new libraries signed up this week.",
      "3 accounts are on a paid plan, worth ₹2,997 a month, and 5 are on a free trial.",
      "Today's daily job ran at 9:01 am without errors.",
    ]);
  });

  it("puts problems first", () => {
    const lines = buildBrief(
      overview({ run: { runDate: "2026-10-02T00:00:00.000Z", status: "FAILED", finishedAt: null, error: "1 step(s) failed" }, failed: 4 }),
      NOW,
    );
    expect(lines[0]).toMatchObject({ tone: "problem", text: "The daily job failed on 2 Oct 2026: 1 step(s) failed" });
    expect(lines[1]).toMatchObject({ tone: "attention", text: "4 texts to students failed this week." });
  });

  it("notices when today's run is missing", () => {
    const lines = buildBrief(
      overview({ run: { runDate: "2026-09-30T00:00:00.000Z", status: "SUCCEEDED", finishedAt: null, error: null } }),
      NOW,
    );
    expect(lines[0]).toMatchObject({ tone: "attention", text: "The daily job hasn't run today. It last ran on 30 Sept 2026." });
  });

  it("handles the first days, before anyone pays", () => {
    const texts = buildBrief(overview({ paid: 0, trial: 1, signups: 1, run: null }), NOW).map((l) => l.text);
    expect(texts).toContain("1 new library signed up this week.");
    expect(texts).toContain("No one is on a paid plan yet; 1 account is on a free trial.");
    expect(texts[0]).toBe("The daily job hasn't run yet.");
  });
});
