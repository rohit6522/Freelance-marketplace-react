import Icon from "../ui/Icon";
import { money } from "../../utils/format";

function Kpi({ label, value, valueClass = "text-on-surface", icon, iconBox, bar, footLabel, foot, footClass }) {
  return (
    <div className="bg-surface-container-lowest p-space-md shadow-sm relative flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider block">{label}</span>
          <div className={`font-headline-lg text-headline-lg mt-1 ${valueClass}`}>{value}</div>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center ${iconBox}`}>
          <Icon name={icon} className="text-body-md" />
        </div>
      </div>
      <div className="mt-space-md pt-space-xs flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{footLabel}</span>
        <span className={`font-code-sm text-code-sm font-bold ${footClass}`}>{foot}</span>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${bar}`} />
    </div>
  );
}

export default function OrderKpis({ stats, role }) {
  const isClient = role === "client";
  const s = stats || {};
  const active = isClient ? s.activePipeline : (s.awaitingAcceptance ?? 0) + (s.activeOrders ?? 0);
  const review = isClient ? s.awaitingReview : s.awaitingClientReview;
  const escrow = isClient ? s.escrowHeld : s.earnings?.pendingInEscrow;
  const onTime = isClient ? s.onTimeCompletion : s.onTimeDelivery;
  const dash = (v, fmt = (x) => x) => (stats && v != null ? fmt(v) : "—");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      <Kpi
        label="Active Pipeline" value={dash(active)} icon="pending_actions" iconBox="bg-tertiary text-on-tertiary" bar="bg-tertiary"
        footLabel="Completed to date" foot={dash(s.completedOrders)} footClass="text-tertiary"
      />
      <Kpi
        label="Awaiting Review" value={dash(review)} icon="rate_review" iconBox="bg-on-tertiary-fixed text-surface-container-lowest" bar="bg-on-tertiary-fixed"
        footLabel={isClient ? "Pending sign-off" : "Waiting on clients"} foot={review > 0 ? (isClient ? "ACTION REQ." : "AWAITING CLIENT") : "ALL CLEAR"} footClass="text-on-tertiary-fixed"
      />
      <Kpi
        label={isClient ? "Escrow Vault Secured" : "Pending in Escrow"} value={dash(escrow, money)} valueClass="text-primary" icon="shield" iconBox="bg-primary text-on-primary" bar="bg-primary"
        footLabel="Escrow type" foot="SIMULATED" footClass="text-primary"
      />
      <Kpi
        label={isClient ? "On-Time Completion" : "On-Time Delivery"} value={onTime?.rate != null ? `${onTime.rate}%` : "—"} icon="verified" iconBox="bg-secondary text-on-secondary" bar="bg-secondary"
        footLabel="Sample size" foot={onTime?.sampleSize ? `${onTime.sampleSize} ORDERS` : "NO DATA YET"} footClass="text-secondary"
      />
    </div>
  );
}