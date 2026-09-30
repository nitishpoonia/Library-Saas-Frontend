const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 125000 -> "₹1,25,000" (Indian grouping), 99.5 -> "₹99.50" */
export function formatRupees(amount: number): string {
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const hasPaise = Math.round(abs * 100) % 100 !== 0;
  const [whole, paise] = abs.toFixed(2).split(".") as [string, string];
  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}` : lastThree;
  return `${negative ? "-" : ""}₹${grouped}${hasPaise ? `.${paise}` : ""}`;
}

/** "2026-01-10" -> "10 Jan 2026" (calendar dates from the API have no timezone). */
export function formatDate(isoDate: string, withYear = true): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  const base = `${Number(d)} ${MONTHS[Number(m) - 1]}`;
  return withYear ? `${base} ${y}` : base;
}

/** "2026-09" -> "September 2026" */
export function formatMonth(month: string): string {
  const full = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [y, m] = month.split("-");
  return `${full[Number(m) - 1]} ${y}`;
}

/** "+919876543210" -> "98765 43210" */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/^\+91/, "");
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : e164;
}

/** Today's date as YYYY-MM-DD on this phone's clock. */
export function todayLocal(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
