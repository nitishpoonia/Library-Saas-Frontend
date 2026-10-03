import { describe, expect, it } from "vitest";
import { formatCalendarDate, formatPaise, relativeDays, todayInIndia } from "./format";

describe("formatting", () => {
  it("shows rupees with Indian grouping and paise only when there are some", () => {
    expect(formatPaise(99_900)).toBe("₹999");
    expect(formatPaise(83_250)).toBe("₹832.50");
    expect(formatPaise(12_345_600)).toBe("₹1,23,456");
  });

  it("uses India's date for 'today', not the server's or UTC", () => {
    // 20:00 UTC on 1 Oct is already 2 Oct in India.
    expect(todayInIndia(new Date("2026-10-01T20:00:00Z"))).toBe("2026-10-02");
  });

  it("doesn't shift calendar dates by a day", () => {
    expect(formatCalendarDate("2026-10-02T00:00:00.000Z")).toBe("2 Oct 2026");
  });

  it("describes days relative to now", () => {
    const now = new Date("2026-10-02T06:00:00Z");
    expect(relativeDays("2026-10-02T09:00:00Z", now)).toBe("today");
    expect(relativeDays("2026-10-05T06:00:00Z", now)).toBe("in 3 days");
    expect(relativeDays("2026-09-30T06:00:00Z", now)).toBe("2 days ago");
    expect(relativeDays(null, now)).toBe("never");
  });
});
