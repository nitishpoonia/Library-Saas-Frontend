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
};
