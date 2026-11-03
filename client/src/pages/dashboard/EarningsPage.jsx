import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import SectionCard from "../../components/dashboard/SectionCard";
import StatCard from "../../components/dashboard/StatCard";
import EarningsChart from "../../components/dashboard/EarningsChart";
import Pagination from "../../components/ui/Pagination";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { useFetch } from "../../hooks/useFetch";
import { dashboardService } from "../../services/dashboardService";
import { paymentService } from "../../services/paymentService";
import { downloadCsv } from "../../utils/csv";
import { money, shortDate } from "../../utils/format";

const STATUS = {
  held: ["In escrow", "bg-secondary-fixed text-on-surface"],
  released: ["Paid out", "bg-primary-container text-on-primary-container"],
  refunded: ["Refunded", "bg-surface-dim text-on-surface-variant"],
  pending: ["Pending", "bg-surface-container-high text-on-surface"],
  failed: ["Failed", "bg-error-container text-on-error-container"],
};

export default function EarningsPage() {
  const [page, setPage] = useState(1);
  const stats = useFetch(() => dashboardService.get("freelancer"), []);
  const pay = useFetch(() => paymentService.mine({ page, limit: 10 }), [page]);

  const exportCsv = () =>
    downloadCsv("gigcraft-payouts.csv", [
      ["Date", "Order", "Gig", "Reference", "Status", "Amount (INR)"],
      ...pay.data.payments.map((p) => [
        shortDate(p.releasedAt || p.createdAt),
        p.order?.orderNumber, p.order?.gig?.title, p.transactionRef, STATUS[p.status]?.[0], p.amount,
      ]),
    ]);

  const error = stats.error || pay.error;
  const s = stats.data?.stats;
  const summary = pay.data?.summary;

  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="SELLER // EARNINGS" title="Earnings & Payout History" description="Every payment linked to your orders. All payments in this project are simulated, so there are no real withdrawals." />

      {error ? (
        <ErrorBox message={error} onRetry={() => { stats.reload(); pay.reload(); }} />
      ) : !s || !summary ? (
        <SkeletonBlocks count={4} cols="grid-cols-2 xl:grid-cols-4" height="h-28" />
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-space-md">
            <StatCard label="Total paid out" value={money(summary.released)} icon="payments" hint="Released to you" />
            <StatCard label="In escrow" value={money(summary.held)} icon="shield" tone="tertiary" hint="Awaiting client approval" />
            <StatCard label="This month" value={money(s.earnings.thisMonth)} icon="calendar_month" tone="secondary" />
            <StatCard label="Refunded" value={money(summary.refunded)} icon="undo" tone="dark" hint="Cancelled orders" />
          </div>

          <SectionCard title="Earnings, last 6 months">
            <EarningsChart data={s.earnings.monthly} />
          </SectionCard>

          <SectionCard
            title="Payment history"
            actions={
              <button type="button" onClick={exportCsv} disabled={!pay.data.payments.length} className="font-label-sm text-label-sm uppercase font-bold border border-on-surface px-space-md py-1.5 hover:bg-surface-container-high disabled:opacity-50">
                Export page (CSV)
              </button>
            }
          >
            {pay.data.payments.length === 0 ? (
              <p className="font-body-md text-on-surface-variant">No payments yet. They appear when clients place orders.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm min-w-[40rem]">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase text-on-surface-variant">
                      {["Date", "Order", "Gig", "Reference", "Status", "Amount"].map((h, i) => (
                        <th key={h} className={`p-space-sm ${i === 5 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pay.data.payments.map((p) => {
                      const [label, chip] = STATUS[p.status] || [p.status, ""];
                      return (
                        <tr key={p._id} className="border-t border-outline-variant">
                          <td className="p-space-sm whitespace-nowrap">{shortDate(p.releasedAt || p.createdAt)}</td>
                          <td className="p-space-sm">
                            {p.order ? <Link to={`/orders?order=${p.order._id}`} className="text-primary font-bold hover:underline">#{p.order.orderNumber}</Link> : "—"}
                          </td>
                          <td className="p-space-sm max-w-[16rem] truncate">{p.order?.gig?.title || p.order?.packageSnapshot?.title}</td>
                          <td className="p-space-sm font-code-sm text-code-sm text-on-surface-variant">{p.transactionRef}</td>
                          <td className="p-space-sm"><span className={`font-label-sm text-label-sm px-space-xs py-0.5 uppercase font-bold ${chip}`}>{label}</span></td>
                          <td className="p-space-sm text-right font-bold text-on-surface">{money(p.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={pay.data.pagination.page} pages={pay.data.pagination.pages} total={pay.data.pagination.total} unit="PAYMENTS" onChange={setPage} />
          </SectionCard>
        </>
      )}
    </div>
  );
}