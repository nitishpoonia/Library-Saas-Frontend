import { useState } from "react";
import { useJobRuns, useNotices } from "../../api/admin";
import type { JobRun } from "../../api/types";
import { Empty, ErrorState, Loading, PageHeader, Pagination, Pill, Select, Table, Td, Th } from "../../components/ui";
import { formatCalendarDate, formatDateTime, formatTime } from "../../lib/format";

const NOTICE_LABEL: Record<string, string> = {
  OVERDUE_NOTICE: "Overdue notice",
  CANCELLATION_WARNING: "Cancellation warning",
  EXPIRY_REMINDER: "Expiry reminder",
  MEMBERSHIP_CANCELLED: "Membership cancelled",
  DAILY_DIGEST: "Owner's daily summary",
  SUBSCRIPTION_REMINDER: "Plan ending reminder",
};

/** "41 s", "3 min". */
function duration(from: string, to: string): string {
  const seconds = Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 1000));
  return seconds < 90 ? `${seconds} s` : `${Math.round(seconds / 60)} min`;
}

/** Counts from a run's stats, when the run recorded them. */
function runSummary(run: JobRun): string {
  const stats = run.stats as { libraries?: number; results?: Array<{ notices?: Record<string, number> }> } | null;
  if (!stats?.results) return "—";
  const sent = stats.results.reduce((n, r) => n + (r.notices?.SENT ?? 0), 0);
  const failed = stats.results.reduce((n, r) => n + (r.notices?.FAILED ?? 0), 0);
  return `${stats.libraries ?? stats.results.length} branches, ${sent} sent${failed ? `, ${failed} failed` : ""}`;
}

function JobRuns() {
  const { data, error, isLoading, refetch } = useJobRuns();
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data || data.length === 0) return <Empty>The daily job hasn't run yet. It runs every day at 9:00 IST.</Empty>;
  return (
    <Table>
      <thead>
        <tr>
          <Th>Day</Th>
          <Th>Result</Th>
          <Th>Ran</Th>
          <Th>What it did</Th>
        </tr>
      </thead>
      <tbody>
        {data.map((run) => (
          <tr key={run.id}>
            <Td>{formatCalendarDate(run.runDate)}</Td>
            <Td>
              {run.status === "SUCCEEDED" && <Pill tone="good">Succeeded</Pill>}
              {run.status === "RUNNING" && <Pill tone="brand">Running</Pill>}
              {run.status === "FAILED" && <Pill tone="critical">Failed</Pill>}
              {run.error && <div className="mt-1 text-xs text-critical">{run.error}</div>}
            </Td>
            <Td>
              {formatTime(run.startedAt)}
              {run.finishedAt && `, took ${duration(run.startedAt, run.finishedAt)}`}
            </Td>
            <Td className="text-quiet">{runSummary(run)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Notices() {
  const [status, setStatus] = useState<"FAILED" | "SKIPPED" | "SENT">("FAILED");
  const [page, setPage] = useState(1);
  const { data, error, isLoading, refetch } = useNotices({ page, status });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="notices" className="text-base">
          Texts and notifications
        </h2>
        <Select
          aria-label="Show"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
        >
          <option value="FAILED">Failed</option>
          <option value="SKIPPED">Skipped</option>
          <option value="SENT">Sent</option>
        </Select>
      </div>
      <p className="mb-3 text-sm text-quiet">
        Failed ones are retried on the next run. Skipped means nothing was sent on purpose, for example no SMS provider is connected yet.
      </p>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data || data.data.length === 0 ? (
        <Empty>{status === "FAILED" ? "No failed texts." : "Nothing here yet."}</Empty>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Branch</Th>
                <Th>Message</Th>
                <Th>To</Th>
                <Th>Why</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((n) => (
                <tr key={n.id}>
                  <Td>{formatDateTime(n.createdAt)}</Td>
                  <Td>{n.library.name}</Td>
                  <Td>
                    {NOTICE_LABEL[n.type] ?? n.type}
                    <div className="text-xs text-quiet">{n.channel === "PUSH" ? "App notification" : n.channel === "SMS" ? "SMS" : "WhatsApp"}</div>
                  </Td>
                  <Td className="font-mono text-xs">{n.recipient.startsWith("user:") ? "Owner or manager" : n.recipient}</Td>
                  <Td className="text-quiet">{n.error ?? "—"}</Td>
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

export function OpsPage() {
  return (
    <div className="space-y-12">
      <section>
        <PageHeader
          title="Daily job and texts"
          description="The daily job updates memberships, texts overdue students and sends owners their summary. Here's the last 30 days."
        />
        <JobRuns />
      </section>
      <section aria-labelledby="notices">
        <Notices />
      </section>
    </div>
  );
}
