import { useQuery } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { accountApi } from "./api";

/** The signed-in user, their organization (owners only) and the branches they can open. */
export function useMe() {
  return useQuery({ queryKey: keys.me, queryFn: accountApi.me, staleTime: 5 * 60_000 });
}
