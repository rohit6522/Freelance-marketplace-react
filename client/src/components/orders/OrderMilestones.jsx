import Icon from "../ui/Icon";
import { dateTime, money } from "../../utils/format";

const STEPS = [
  ["pending", "Order Placed & Payment Held", "Requirements submitted and the amount held in simulated escrow."],
  ["in_progress", "Order Accepted by Seller", "Seller confirmed the scope and started work."],
  ["delivered", "Work Delivered", "Deliverables submitted for the client to review."],
  ["completed", "Approved & Funds Released", "Client approved the delivery and escrow was released."],
];

const PAYMENT_BADGE = {
  held: ["ESCROW HELD", "text-on-surface"],
  released: ["RELEASED", "text-primary"],
  refunded: ["REFUNDED", "text-on-surface-variant"],
  pending: ["PENDING", "text-on-surface"],
  failed: ["FAILED", "text-error"],
};

export default function OrderMilestones({ order, payment }) {
  const lastAt = (status) => [...order.statusHistory].reverse().find((h) => h.status === status)?.at;
  const cancelled = order.status === "cancelled";
  const inRevision = order.status === "revision_requested";

  const states = STEPS.map(([key]) => {
    const at = lastAt(key);
    const done = Boolean(at) && !(inRevision && key === "delivered");
    return { at, done };
  });
  const currentIndex = cancelled || order.status === "completed" ? -1 : states.findIndex((s) => !s.done);
  const doneCount = states.filter((s) => s.done).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);
  const [badgeText, badgeColor] = PAYMENT_BADGE[payment?.status] || PAYMENT_BADGE.pending;

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Execution Milestones & Audit Trail</h3>
        <span className={`font-code-sm text-code-sm ${cancelled ? "text-error font-bold" : "text-on-surface-variant"}`}>
          {cancelled ? "CANCELLED" : `${pct}% PROGRESS`}
        </span>
      </div>
      <div className="w-full h-2 bg-surface-container-low flex" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full ${cancelled ? "bg-error" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-col gap-space-md mt-space-xs">
        {STEPS.map(([key, title, text], i) => {
          const s = states[i];
          const current = i === currentIndex;
          const desc = current && inRevision && key === "delivered" ? "Revision requested. Waiting for the seller to re-deliver." : text;
          return (
            <div key={key} className={`flex items-start gap-space-md ${current ? "bg-surface-container-low p-space-sm" : ""} ${!s.done && !current ? "opacity-70" : ""}`}>
              <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${s.done ? "bg-primary text-on-primary" : current ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-on-surface-variant"}`}>
                {s.done ? <Icon name="check" className="text-body-md" /> : current ? <span className="w-2.5 h-2.5 bg-surface-container-lowest" /> : <span className="font-code-sm text-code-sm font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div>
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <h4 className="font-label-md text-label-md text-on-surface uppercase">Step {i + 1}: {title}</h4>
                    {current && <span className="font-label-sm text-label-sm bg-tertiary text-surface-container-lowest px-space-xs uppercase">Current</span>}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{desc}</p>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {s.at && <span className="font-code-sm text-code-sm text-on-surface-variant">{dateTime(s.at)}</span>}
                  {key === "completed" && payment && (
                    <span className={`font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 font-bold ${badgeColor}`}>{badgeText} ({money(payment.amount)})</span>
                  )}
                  {current && key === "in_progress" && order.dueDate === undefined && null}
                </div>
              </div>
            </div>
          );
        })}
        {cancelled && (
          <div className="flex items-start gap-space-md bg-error-container p-space-sm text-on-error-container">
            <div className="w-7 h-7 bg-error text-on-error flex items-center justify-center shrink-0"><Icon name="close" className="text-body-md" /></div>
            <div>
              <h4 className="font-label-md text-label-md uppercase">Order cancelled</h4>
              <p className="font-body-sm text-body-sm">{order.cancelReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}