import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import OrderStatusChip from "../orders/OrderStatusChip";
import { fullName, money } from "../../utils/format";

export default function RecentOrders({ orders, role }) {
  if (!orders.length) {
    return <p className="font-body-md text-on-surface-variant">No orders yet.</p>;
  }
  return (
    <ul className="divide-y divide-outline-variant">
      {orders.map((o) => {
        const other = role === "client" ? o.freelancer : o.client;
        return (
          <li key={o._id}>
            <Link to={`/orders?order=${o._id}`} className="flex items-center justify-between gap-space-md py-space-sm px-space-xs hover:bg-surface-container-low">
              <div className="flex items-center gap-space-sm min-w-0">
                <Avatar user={other} square className="w-9 h-9" />
                <div className="min-w-0">
                  <div className="font-label-md text-label-md text-on-surface font-bold truncate">{o.gig?.title || o.packageSnapshot?.title}</div>
                  <div className="font-code-sm text-code-sm text-on-surface-variant truncate">
                    #{o.orderNumber} // {other?.companyName || fullName(other)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-sm shrink-0">
                <OrderStatusChip status={o.status} role={role} className="hidden sm:inline-block" />
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{money(o.price)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}