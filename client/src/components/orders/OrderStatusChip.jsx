import { ORDER_STATUS, statusLabel } from "../../utils/format";

export default function OrderStatusChip({ status, role, className = "" }) {
  const meta = ORDER_STATUS[status];
  return (
    <span className={`font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-wider font-semibold ${meta?.chip || ""} ${className}`}>
      {statusLabel(status, role)}
    </span>
  );
}