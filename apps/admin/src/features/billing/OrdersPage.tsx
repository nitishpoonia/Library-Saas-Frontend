import { Link, useSearchParams } from "react-router";
import { useOrders } from "../../api/admin";
import { Empty, ErrorState, Loading, PageHeader, Pagination, Pill, Select, Table, Td, Th } from "../../components/ui";
import { describePayment, formatDateTime, formatPaise } from "../../lib/format";

export function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1) || 1;
  const status = (params.get("status") as "CREATED" | "PAID" | null) ?? undefined;
  const { data, error, isLoading, refetch } = useOrders({ page, status });

  const set = (next: { page?: number; status?: string }) => {
    const out = new URLSearchParams();
    const merged = { page: 1, status, ...next };
    if (merged.status) out.set("status", merged.status);
    if (merged.page > 1) out.set("page", String(merged.page));
    setParams(out, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every Razorpay checkout an owner opened. Unpaid ones are usually abandoned checkouts; a UPI request can still be paid hours later."
        actions={
          <Select aria-label="Status" value={status ?? ""} onChange={(e) => set({ status: e.target.value || undefined })}>
            <option value="">Paid and unpaid</option>
            <option value="PAID">Paid</option>
            <option value="CREATED">Not paid</option>
          </Select>
        }
      />
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data || data.data.length === 0 ? (
        <Empty>No payments yet.</Empty>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Owner</Th>
                <Th>What</Th>
                <Th align="right">Amount</Th>
                <Th>Status</Th>
                <Th>Opened</Th>
                <Th>Razorpay order</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <Link to={`/accounts/${o.organizationId}`} className="font-medium hover:text-brand hover:underline">
                      {o.ownerName}
                    </Link>
                  </Td>
                  <Td>{describePayment(o)}</Td>
                  <Td align="right">{formatPaise(o.amountPaise)}</Td>
                  <Td>{o.status === "PAID" ? <Pill tone="good">Paid {formatDateTime(o.paidAt)}</Pill> : <Pill tone="muted">Not paid</Pill>}</Td>
                  <Td>{formatDateTime(o.createdAt)}</Td>
                  <Td className="font-mono text-xs text-quiet">{o.razorpayOrderId}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} meta={data.meta} onPage={(p) => set({ page: p })} />
        </>
      )}
    </>
  );
}
