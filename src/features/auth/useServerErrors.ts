import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/api/errors";

/**
 * Puts the server's field errors (400 VALIDATION_ERROR) under the matching inputs.
 * Returns true if at least one landed on a field; otherwise show the error as a banner.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: Array<Path<T>>): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const [path, message] of Object.entries(error.fieldErrors)) {
    if ((fields as string[]).includes(path)) {
      setError(path as Path<T>, { type: "server", message });
      applied = true;
    }
  }
  return applied;
}
