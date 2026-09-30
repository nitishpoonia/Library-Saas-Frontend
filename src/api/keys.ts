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
};
