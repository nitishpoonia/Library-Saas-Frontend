/**
 * Every React Query key in one place (REVIEW FD2, FD3). Branch data starts with
 * ["library", libraryId], so switching branch never shows another branch's data,
 * and invalidating ["library", id] refreshes everything for that branch.
 */
export const keys = {
  me: ["me"] as const,
  library: (libraryId: number) => ["library", libraryId] as const,
  libraryDetails: (libraryId: number) => ["library", libraryId, "details"] as const,
  dashboard: (libraryId: number, month?: string) => ["library", libraryId, "dashboard", month ?? "current"] as const,
  students: (libraryId: number, filter?: { status: string; search: string }) =>
    filter ? (["library", libraryId, "students", filter] as const) : (["library", libraryId, "students"] as const),
  student: (libraryId: number, studentId: number) => ["library", libraryId, "student", studentId] as const,
  availability: (libraryId: number, params: Record<string, string | number>) =>
    ["library", libraryId, "availability", params] as const,
  receipt: (libraryId: number, paymentId: number) => ["library", libraryId, "receipt", paymentId] as const,
  expenses: (libraryId: number, month?: string) =>
    month ? (["library", libraryId, "expenses", month] as const) : (["library", libraryId, "expenses"] as const),
  seats: (libraryId: number) => ["library", libraryId, "seats"] as const,
  staff: (libraryId: number) => ["library", libraryId, "staff"] as const,
  billing: ["billing"] as const,
};

/**
 * `placeholderData` for lists whose filter, search or month changes: keeps showing the
 * previous results while the new ones load, instead of blanking the screen. Only within
 * the same branch, so switching branch never flashes another branch's data.
 */
export function keepWithinBranch(libraryId: number) {
  return <T>(previous: T | undefined, previousQuery?: { queryKey: readonly unknown[] }) =>
    previousQuery?.queryKey[0] === "library" && previousQuery.queryKey[1] === libraryId ? previous : undefined;
}
