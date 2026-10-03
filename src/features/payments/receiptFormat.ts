import type { Receipt } from "@/api/types";
import { formatDate, formatRupees } from "@/lib/format";
import { paymentModeLabel } from "./paymentModes";

// Pure text and HTML for receipts: no device APIs, so it's easy to test.

/** Escapes text before it goes into the receipt HTML (REVIEW FU7). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function receiptText(r: Receipt): string {
  const lines = [
    `*${r.libraryName}* — Payment receipt`,
    `Receipt ${r.receiptNumber}`,
    ``,
    `Student: ${r.studentName}`,
    `Seat ${r.seatLabel ?? "-"} · ${r.timing}`,
    `Period: ${formatDate(r.periodStart)} to ${formatDate(r.periodEnd)}`,
    ``,
    `Paid now: ${formatRupees(r.amount)} (${paymentModeLabel(r.mode)})`,
    `Total paid: ${formatRupees(r.totalPaid)} of ${formatRupees(r.fee)}`,
  ];
  if (r.pendingAmount > 0) lines.push(`Pending: ${formatRupees(r.pendingAmount)}`);
  if (r.voided) lines.push(``, `This payment was cancelled.`);
  return lines.join("\n");
}

export function receiptHtml(r: Receipt): string {
  const e = escapeHtml;
  const row = (label: string, value: string, strong = false) =>
    `<tr><td>${e(label)}</td><td class="${strong ? "strong" : ""}">${e(value)}</td></tr>`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #1F2937; padding: 24px; }
  .card { max-width: 480px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; }
  h1 { font-size: 20px; margin: 0; } .muted { color: #6B7280; font-size: 13px; margin: 4px 0 16px; }
  .badge { background: #EFF6FF; color: #2563EB; border-radius: 8px; padding: 8px 12px; font-weight: 600; display: inline-block; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  td { padding: 8px 0; border-bottom: 1px solid #F3F4F6; } td:last-child { text-align: right; }
  .strong { font-weight: 700; } .pending { color: #D97706; } .void { color: #B91C1C; font-weight: 700; margin-top: 16px; }
</style></head>
<body><div class="card">
  <h1>${e(r.libraryName)}</h1>
  <div class="muted">${e(r.libraryAddress)}</div>
  <div class="badge">Receipt ${e(r.receiptNumber)}</div>
  <table>
    ${row("Date", formatDate(r.paidAt.slice(0, 10)))}
    ${row("Student", r.studentName, true)}
    ${row("Seat", `${r.seatLabel ?? "-"} · ${r.timing}`)}
    ${row("Period", `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`)}
    ${row("Paid now", `${formatRupees(r.amount)} (${paymentModeLabel(r.mode)})`, true)}
    ${row("Total paid", `${formatRupees(r.totalPaid)} of ${formatRupees(r.fee)}`)}
    ${r.pendingAmount > 0 ? `<tr><td>Pending</td><td class="strong pending">${e(formatRupees(r.pendingAmount))}</td></tr>` : ""}
  </table>
  ${r.voided ? `<div class="void">This payment was cancelled${r.voidReason ? `: ${e(r.voidReason)}` : ""}.</div>` : ""}
</div></body></html>`;
}
