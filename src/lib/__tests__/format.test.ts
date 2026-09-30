import { subscriptionLabel } from "@/features/libraries/subscriptionLabel";
import { formatDate, formatMonth, formatPhone, formatRupees } from "../format";

describe("formatRupees", () => {
  it("uses Indian digit grouping", () => {
    expect(formatRupees(0)).toBe("₹0");
    expect(formatRupees(999)).toBe("₹999");
    expect(formatRupees(1000)).toBe("₹1,000");
    expect(formatRupees(125000)).toBe("₹1,25,000");
    expect(formatRupees(12345678)).toBe("₹1,23,45,678");
  });

  it("shows paise only when there are some", () => {
    expect(formatRupees(99.5)).toBe("₹99.50");
    expect(formatRupees(-1500)).toBe("-₹1,500");
  });
});

describe("dates and phones", () => {
  it("formats calendar dates without timezone shifts", () => {
    expect(formatDate("2026-01-10")).toBe("10 Jan 2026");
    expect(formatDate("2026-12-31", false)).toBe("31 Dec");
    expect(formatMonth("2026-09")).toBe("September 2026");
  });

  it("formats Indian mobile numbers", () => {
    expect(formatPhone("+919876543210")).toBe("98765 43210");
  });
});

describe("subscriptionLabel", () => {
  it("never shows an ended subscription as active (REVIEW FU5)", () => {
    expect(subscriptionLabel({ status: "EXPIRED", usable: false, endsAt: null, daysRemaining: 0 })).toEqual({
      text: "Subscription ended",
      urgent: true,
    });
    expect(subscriptionLabel({ status: "TRIALING", usable: true, endsAt: null, daysRemaining: 1 }).text).toBe(
      "Free trial · 1 day left",
    );
    expect(subscriptionLabel({ status: "ACTIVE", usable: true, endsAt: null, daysRemaining: 40 })).toEqual({
      text: "Plan · 40 days left",
      urgent: false,
    });
  });
});
