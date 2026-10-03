import type { Membership } from "@/api/types";
import { membershipStatus } from "../membershipStatus";
import { cleanPhone, newStudentSchema } from "../schemas";

const base: Membership = {
  id: 1,
  seatId: 1,
  seatLabel: "12",
  startDate: "2026-01-01",
  endDate: "2026-01-30",
  timing: "09:00-17:00",
  startTime: "09:00",
  endTime: "17:00",
  status: "ACTIVE",
  fee: 1000,
  amountPaid: 1000,
  pendingAmount: 0,
  paymentStatus: "PAID",
  daysRemaining: 20,
  graceEndsOn: null,
  graceDaysLeft: null,
  cancelReason: null,
  renewsId: null,
};

describe("membershipStatus", () => {
  it("shows active, ending soon and upcoming", () => {
    expect(membershipStatus(base, "2026-01-10")).toMatchObject({ label: "Active", tone: "success" });
    expect(membershipStatus({ ...base, daysRemaining: 3 }, "2026-01-27")).toMatchObject({ label: "3 days left", tone: "warning" });
    expect(membershipStatus({ ...base, startDate: "2026-02-01" }, "2026-01-27")).toMatchObject({ label: "Upcoming" });
  });

  it("follows the overdue rule: seat held, then released", () => {
    const overdue = { ...base, status: "OVERDUE" as const, graceEndsOn: "2026-02-05", graceDaysLeft: 4 };
    expect(membershipStatus(overdue)).toEqual({ label: "Overdue", detail: "Seat held till 5 Feb (4 days)", tone: "danger" });
    expect(membershipStatus({ ...overdue, graceDaysLeft: 1 }).detail).toBe("Seat released tomorrow unless renewed");
    expect(membershipStatus({ ...base, status: "CANCELLED", cancelReason: "NOT_RENEWED" }).label).toBe("Cancelled");
    expect(membershipStatus({ ...base, status: "CANCELLED", cancelReason: "REMOVED" }).label).toBe("Removed");
  });
});

describe("new student form", () => {
  const valid = {
    name: "Ravi Kumar",
    phone: "98765 43210",
    startDate: "2026-01-01",
    days: "30",
    startTime: "09:00",
    endTime: "17:00",
    fee: "1000",
    paidNow: "400",
    mode: "CASH" as const,
    seatId: 3,
  };

  it("accepts a valid student", () => {
    expect(newStudentSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses paying more than the fee, a missing seat and a bad phone", () => {
    const errors = (v: object) =>
      newStudentSchema.safeParse({ ...valid, ...v }).error?.issues.map((i) => i.path.join("."));
    expect(errors({ paidNow: "1500" })).toEqual(["paidNow"]);
    expect(errors({ seatId: null })).toEqual(["seatId"]);
    expect(errors({ phone: "12345" })).toEqual(["phone"]);
    expect(errors({ days: "0" })).toEqual(["days"]);
  });

  it("sends a plain 10-digit number", () => {
    expect(cleanPhone("+91 98765 43210")).toBe("9876543210");
    expect(cleanPhone("09876543210")).toBe("9876543210");
    expect(cleanPhone("9876543210")).toBe("9876543210");
  });
});
