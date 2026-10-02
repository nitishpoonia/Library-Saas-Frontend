import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useOrganizations, type OrganizationFilters } from "../../api/admin";
import type { SubscriptionStatus } from "../../api/types";
import { AccountStatus, Empty, ErrorState, Input, Loading, PageHeader, Pagination, Select, Table, Td, Th } from "../../components/ui";
import { formatDate, relativeDays, STATUS_LABEL } from "../../lib/format";

/** Filters live in the URL, so a filtered list can be bookmarked or linked from the overview. */
function useFilters(): [OrganizationFilters, (next: Partial<OrganizationFilters>) => void] {
  const [params, setParams] = useSearchParams();
  const filters: OrganizationFilters = {
    page: Number(params.get("page") ?? 1) || 1,
    search: params.get("search") ?? undefined,
    status: (params.get("status") as SubscriptionStatus | null) ?? undefined,
    suspended: (params.get("suspended") as "true" | "false" | null) ?? undefined,
  };
  const update = (next: Partial<OrganizationFilters>) => {
    const merged = { ...filters, page: 1, ...next };
    const out = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "" && !(key === "page" && value === 1)) out.set(key, String(value));
    }
    setParams(out, { replace: true });
  };
  return [filters, update];
}

export function AccountsPage() {
  const [filters, setFilters] = useFilters();
  const [search, setSearch] = useState(filters.search ?? "");
  const { data, error, isLoading, refetch, isFetching } = useOrganizations(filters);

  // Search as you type, after a short pause.
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.search ?? "") !== search) setFilters({ search: search || undefined });
    }, 300);
    return () => clearTimeout(timer);
  });

  return (
    <>
      <PageHeader title="Accounts" description="Every library owner's account, newest first." />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="search"
          placeholder="Search owner name, email, phone or library"
          aria-label="Search accounts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          aria-label="Subscription"
          value={filters.status ?? ""}
          onChange={(e) => setFilters({ status: (e.target.value || undefined) as SubscriptionStatus | undefined })}
        >
          <option value="">Any subscription</option>
          {(Object.keys(STATUS_LABEL) as SubscriptionStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Suspension"
          value={filters.suspended ?? ""}
          onChange={(e) => setFilters({ suspended: (e.target.value || undefined) as "true" | "false" | undefined })}
        >
          <option value="">Suspended or not</option>
          <option value="true">Suspended</option>
          <option value="false">Not suspended</option>
        </Select>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data || data.data.length === 0 ? (
        <Empty>{filters.search || filters.status || filters.suspended ? "No accounts match these filters." : "No one has signed up yet."}</Empty>
      ) : (
        <div className={isFetching ? "opacity-70" : undefined}>
          <Table>
            <thead>
              <tr>
                <Th>Owner</Th>
                <Th>Status</Th>
                <Th align="right">Branches</Th>
                <Th>Trial or plan ends</Th>
                <Th>Last active</Th>
                <Th>Signed up</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((org) => {
                const unpaid = org.status === "ACTIVE" ? Math.max(0, org.branches - org.billedBranches) : 0;
                return (
                  <tr key={org.id} className="hover:bg-paper">
                    <Td>
                      <Link to={`/accounts/${org.id}`} className="font-medium text-ink hover:text-brand hover:underline">
                        {org.owner.name}
                      </Link>
                      <div className="text-xs text-quiet">{org.owner.phone ?? org.owner.email}</div>
                    </Td>
                    <Td>
                      <AccountStatus status={org.status} suspended={org.suspended} />
                    </Td>
                    <Td align="right">
                      {org.branches}
                      {unpaid > 0 && <div className="text-xs text-warn">{unpaid} unpaid</div>}
                    </Td>
                    <Td>{formatDate(org.status === "TRIALING" ? org.trialEndsAt : (org.currentPeriodEnd ?? org.trialEndsAt))}</Td>
                    <Td>{relativeDays(org.lastActiveAt)}</Td>
                    <Td>{formatDate(org.createdAt)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination page={filters.page} meta={data.meta} onPage={(page) => setFilters({ page })} />
        </div>
      )}
    </>
  );
}
