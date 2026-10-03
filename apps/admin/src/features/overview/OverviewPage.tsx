import clsx from "clsx";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useOverview } from "../../api/admin";
import { ErrorState, Loading } from "../../components/ui";
import { formatPaise } from "../../lib/format";
import { buildBrief } from "./brief";

function Row({ label, value, to }: { label: string; value: ReactNode; to?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-sm text-quiet">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">
        {to ? (
          <Link to={to} className="hover:text-brand hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function OverviewPage() {
  const { data, error, isLoading, refetch } = useOverview();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const brief = buildBrief(data);
  const s = data.organizations.byStatus;
  const conversion = data.trialConversion;

  return (
    <div className="space-y-12">
      {/* The day in a few sentences, problems first. */}
      <section aria-labelledby="today">
        <h1 id="today" className="sr-only">
          Today
        </h1>
        <div className="max-w-3xl space-y-2">
          {brief.map((line) => (
            <p
              key={line.text}
              className={clsx(
                "font-display text-xl leading-snug md:text-2xl",
                line.tone === "normal" && "text-ink",
                line.tone === "attention" && "border-l-4 border-warn pl-3 text-warn",
                line.tone === "problem" && "border-l-4 border-critical pl-3 text-critical",
              )}
            >
              {line.link ? (
                <Link to={line.link} className="hover:underline">
                  {line.text}
                </Link>
              ) : (
                line.text
              )}
            </p>
          ))}
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section aria-labelledby="accounts-heading">
          <h2 id="accounts-heading" className="mb-2 text-base">
            Accounts
          </h2>
          <dl>
            <Row label="On a free trial" value={s.TRIALING ?? 0} to="/accounts?status=TRIALING" />
            <Row label="Paying" value={s.ACTIVE ?? 0} to="/accounts?status=ACTIVE" />
            <Row label="Expired" value={s.EXPIRED ?? 0} to="/accounts?status=EXPIRED" />
            <Row label="Suspended" value={data.organizations.suspended} to="/accounts?suspended=true" />
            <Row label="Signed up in the last 30 days" value={data.organizations.signupsLast30Days} />
          </dl>
        </section>

        <section aria-labelledby="money-heading">
          <h2 id="money-heading" className="mb-2 text-base">
            Money
          </h2>
          <dl>
            <Row label="Monthly revenue from plans" value={formatPaise(data.revenue.mrrPaise)} />
            <Row label="Collected in the last 30 days" value={formatPaise(data.revenue.collectedLast30DaysPaise)} to="/billing?status=PAID" />
            <Row
              label="Trials that became paid"
              value={
                conversion.rate === null
                  ? "No trial has ended yet"
                  : `${conversion.paid} of ${conversion.trialsEnded} (${Math.round(conversion.rate * 100)}%)`
              }
            />
          </dl>
          <p className="mt-3 text-xs text-quiet">
            Monthly revenue spreads each plan over its months, so a yearly plan counts as a twelfth. Extra-branch payments aren't included.
          </p>
        </section>
      </div>
    </div>
  );
}
