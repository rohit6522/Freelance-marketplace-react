import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import OrderStatusChip from "./OrderStatusChip";
import { dayMonth, dueText, fullName, money } from "../../utils/format";

function metaFor(o, role) {
  switch (o.status) {
    case "pending":
      return ["hourglass_top", role === "client" ? "Awaiting seller" : "Needs your response"];
    case "in_progress":
    case "revision_requested":
      return ["schedule", dueText(o.dueDate) || "In progress"];
    case "delivered":
      return ["inventory_2", `Delivered ${dayMonth(o.updatedAt)}`];
    case "completed":
      return ["check_circle", `Closed ${dayMonth(o.completedAt)}`];
    default:
      return ["cancel", `Cancelled ${dayMonth(o.updatedAt)}`];
  }
}

export default function OrderList({ orders, selectedId, onSelect, role }) {
  return (
    <ul className="flex flex-col gap-space-sm">
      {orders.map((o) => {
        const active = o._id === selectedId;
        const other = role === "client" ? o.freelancer : o.client;
        const [icon, meta] = metaFor(o, role);
        return (
          <li key={o._id}>
            <button
              type="button" onClick={() => onSelect(o._id)} aria-current={active ? "true" : undefined}
              className={`w-full text-left bg-surface-container-lowest p-space-md cursor-pointer transition-colors relative ${active ? "shadow-md" : "shadow-sm"}`}
            >
              <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className={`font-code-sm text-code-sm font-bold bg-surface-container px-space-xs py-0.5 ${active ? "text-primary" : "text-on-surface"}`}>#{o.orderNumber}</span>
                  <OrderStatusChip status={o.status} role={role} />
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{money(o.price)}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs leading-snug">{o.gig?.title || o.packageSnapshot?.title}</h3>
              <div className="flex items-center justify-between gap-2 mt-space-md pt-space-sm bg-surface-container-low p-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Avatar user={other} square className="w-6 h-6" />
                  <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">{other?.companyName || fullName(other)}</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant shrink-0">
                  <Icon name={icon} className="text-body-sm" />
                  <span className="font-code-sm text-code-sm font-medium">{meta}</span>
                </div>
              </div>
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${active ? "bg-primary" : "bg-transparent"}`} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}