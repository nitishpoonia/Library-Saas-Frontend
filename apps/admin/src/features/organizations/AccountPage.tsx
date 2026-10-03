import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { useOrganization } from "../../api/admin";
import type { OrganizationDetail } from "../../api/types";
import { AccountStatus, Empty, ErrorState, Loading, Pill, Table, Td, Th } from "../../components/ui";
import { ACTION_LABEL, describePayment, formatDate, formatDateTime, formatPaise, plural, relativeDays } from "../../lib/format";
import { ActionDialog, type ActionSpec } from "./ActionDialog";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-line py-2.5">
      <dt className="text-xs text-quiet">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/** Which actions make sense for this account right now. */
function actionsFor(org: OrganizationDetail): ActionSpec[] {
  const actions: ActionSpec[] = [];
  const neverPaid = org.currentPeriodEnd === null;
  if (org.status === "TRIALING" || (org.status === "EXPIRED" && neverPaid)) {
    actions.push({
      action: "extend-trial",
      label: "Extend trial",
      done: "Trial extended.",
      askDays: true,
      consequence:
        org.status === "EXPIRED"
          ? "Reopens the free trial. The owner can make changes again until the new end date."
          : "Adds days to the free trial, from its current end date.",
    });
  }
  actions.push({
    action: "revoke-sessions",
    label: "Log out everywhere",
    done: "The owner is logged out on every device.",
    consequence: `Ends the owner's ${plural(org.activeOwnerSessions, "active login")}. Each phone has to log in again within 15 minutes. Use it for a lost or stolen phone.`,
  });
  actions.push(
    org.suspended
      ? {
          action: "unsuspend",
          label: "Restore account",
          done: "Account restored.",
          consequence: "The owner and their staff can make changes again, and student texts resume.",
        }
      : {
          action: "suspend",
          label: "Suspend account",
          done: "Account suspended.",
          danger: true,
          consequence:
            "The owner and staff can still log in and see their data, but can't change anything. Student texts stop. You can restore it any time.",
        },
  );
  return actions;
}

export function AccountPage() {
  const id = Number(useParams().id);
  const { data: org, error, isLoading, refetch } = useOrganization(id);
  const [notice, setNotice] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (error || !org) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/accounts" className="text-sm text-quiet hover:text-ink">
          Accounts
        </Link>
        <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl">{org.owner.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-quiet">
              <AccountStatus status={org.status} suspended={org.suspended} />
              {org.owner.phone && <span>{org.owner.phone}</span>}
              {org.owner.email && <span>{org.owner.email}</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {actionsFor(org).map((spec) => (
              <ActionDialog key={spec.action} orgId={org.id} spec={spec} onDone={setNotice} />
            ))}
          </div>
        </header>
        {notice && (
          <p className="mt-4 rounded-md bg-good-soft px-3 py-2 text-sm text-good" role="status">
            {notice}
          </p>
        )}
        {org.suspended && (
          <p className="mt-4 rounded-md bg-critical-soft px-3 py-2 text-sm text-critical">
            Suspended on {formatDate(org.suspendedAt)}
            {org.suspendReason ? `: ${org.suspendReason}` : "."}
          </p>
        )}
      </div>

      <dl className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Free trial ends">{formatDate(org.trialEndsAt)}</Fact>
        <Fact label="Paid until">{formatDate(org.currentPeriodEnd)}</Fact>
        <Fact label="Can make changes">{org.usable ? "Yes" : "No"}</Fact>
        <Fact label="Branches paid for">
          {org.billedBranches} of {org.branches.length}
          {org.unpaidBranches > 0 && <span className="ml-2 text-warn">{org.unpaidBranches} read-only until paid</span>}
        </Fact>
        <Fact label="Logged in on">{plural(org.activeOwnerSessions, "device")}</Fact>
        <Fact label="Signed up">{formatDate(org.createdAt)}</Fact>
      </dl>

      <section aria-labelledby="branches">
        <h2 id="branches" className="mb-3 text-base">
          Branches
        </h2>
        {org.branches.length === 0 ? (
          <Empty>The owner hasn't set up a branch yet.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Branch</Th>
                <Th align="right">Seats</Th>
                <Th align="right">Students</Th>
                <Th align="right">Staff logins</Th>
                <Th>Added</Th>
              </tr>
            </thead>
            <tbody>
              {org.branches.map((b) => (
                <tr key={b.id}>
                  <Td>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-quiet">{b.address}</div>
                  </Td>
                  <Td align="right">{b.seats}</Td>
                  <Td align="right">{b.students}</Td>
                  <Td align="right">{b.staff}</Td>
                  <Td>{formatDate(b.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section aria-labelledby="payments">
        <h2 id="payments" className="mb-3 text-base">
          Subscription payments
        </h2>
        {org.payments.length === 0 ? (
          <Empty>No payments yet. Opened checkouts appear here too.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>What</Th>
                <Th align="right">Amount</Th>
                <Th>Status</Th>
                <Th>Covers</Th>
                <Th>Razorpay</Th>
              </tr>
            </thead>
            <tbody>
              {org.payments.map((p) => (
                <tr key={p.id}>
                  <Td>{describePayment(p)}</Td>
                  <Td align="right">{formatPaise(p.amountPaise)}</Td>
                  <Td>
                    {p.status === "PAID" ? (
                      <Pill tone="good">Paid {formatDate(p.paidAt)}</Pill>
                    ) : (
                      <Pill tone="muted">Not paid, opened {formatDate(p.createdAt)}</Pill>
                    )}
                  </Td>
                  <Td>{p.periodStart ? `${formatDate(p.periodStart)} to ${formatDate(p.periodEnd)}` : "—"}</Td>
                  <Td className="font-mono text-xs text-quiet">
                    {p.razorpayOrderId}
                    {p.razorpayPaymentId && <div>{p.razorpayPaymentId}</div>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section aria-labelledby="history">
        <h2 id="history" className="mb-3 text-base">
          Admin actions on this account
        </h2>
        {org.recentAdminActions.length === 0 ? (
          <Empty>No admin has changed this account.</Empty>
        ) : (
          <ul className="space-y-3">
            {org.recentAdminActions.map((a) => (
              <li key={a.id} className="text-sm">
                <span className="font-medium">{ACTION_LABEL[a.action] ?? a.action}</span>
                <span className="text-quiet">
                  {" "}
                  by {a.admin}, {formatDateTime(a.createdAt)} ({relativeDays(a.createdAt)})
                </span>
                {a.reason && <p className="text-quiet">“{a.reason}”</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
