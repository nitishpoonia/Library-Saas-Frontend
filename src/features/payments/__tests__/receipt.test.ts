import type { Receipt } from "@/api/types";

import { receiptHtml, receiptText } from "../receiptFormat";

const receipt: Receipt = {
  id: 7,
  membershipId: 1,
  amount: 600,
  mode: "UPI",
  paidAt: "2026-01-05T10:00:00.000Z",
  receiptNumber: "RCP-000007",
  notes: null,
  voided: false,
  voidedAt: null,
  voidReason: null,
  libraryName: "Focus <Library> & Co",
  libraryAddress: "Sector 14",
  studentName: "Ravi \"R\" Kumar",
  studentPhone: "+919876543210",
  seatLabel: "12",
  timing: "22:00-02:00",
  periodStart: "2026-01-01",
  periodEnd: "2026-01-30",
  fee: 1000,
  totalPaid: 600,
  pendingAmount: 400,
};

describe("receipts", () => {
  it("escapes names so the PDF layout can't break (REVIEW FU7)", () => {
    const html = receiptHtml(receipt);
    expect(html).toContain("Focus &lt;Library&gt; &amp; Co");
    expect(html).toContain("Ravi &quot;R&quot; Kumar");
    expect(html).not.toContain("<Library>");
  });

  it("builds the WhatsApp text with what's pending", () => {
    const text = receiptText(receipt);
    expect(text).toContain("Paid now: ₹600 (UPI)");
    expect(text).toContain("Total paid: ₹600 of ₹1,000");
    expect(text).toContain("Pending: ₹400");
  });

  it("marks cancelled payments", () => {
    expect(receiptText({ ...receipt, voided: true })).toContain("This payment was cancelled.");
  });
});
