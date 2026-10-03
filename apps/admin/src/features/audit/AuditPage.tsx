import { useState } from "react";
import { Link } from "react-router";
import { useAuditLog } from "../../api/admin";
import { Empty, ErrorState, Loading, PageHeader, Pagination, Table, Td, Th } from "../../components/ui";
import { ACTION_LABEL, formatDateTime } from "../../lib/format";

/** "{trialEndsAt: …}" → a short readable line of what changed. */
function describeChange(before: unknown, after: unknown): string {
  const fmt = (v: unknown) => {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return formatDateTime(v);
    return String(v);
  };
  const a = (after ?? {}) as Record<string, unknown>;
  const b = (before ?? {}) as Record<string, unknown>;
  const keys = Object.keys(a);
  if (keys.length === 0) return "";
  return keys
    .map((k) => (k in b ? `${k}: ${fmt(b[k])} → ${fmt(a[k])}` : `${k}: ${fmt(a[k])}`))
    .join("; ");
}

export function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, refetch } = useAuditLog({ page });

  return (
    <>
      <PageHeader title="Audit log" description="Every change an admin made, newest first. Entries can't be edited or deleted." />
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data || data.data.length === 0 ? (
        <Empty>No admin actions yet.</Empty>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Who</Th>
                <Th>What</Th>
                <Th>Reason</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((e) => (
                <tr key={e.id}>
                  <Td className="whitespace-nowrap">{formatDateTime(e.createdAt)}</Td>
                  <Td>{e.admin.name}</Td>
                  <Td>
                    <span className="font-medium">{ACTION_LABEL[e.action] ?? e.action}</span>
                    {e.targetType === "organization" && e.targetId && (
                      <>
                        {" "}
                        <Link to={`/accounts/${e.targetId}`} className="text-brand hover:underline">
                          account #{e.targetId}
                        </Link>
                      </>
                    )}
                    {describeChange(e.before, e.after) && (
                      <div className="mt-0.5 text-xs text-quiet">{describeChange(e.before, e.after)}</div>
                    )}
                  </Td>
                  <Td className="text-quiet">{e.reason ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} meta={data.meta} onPage={setPage} />
        </>
      )}
    </>
  );
}
