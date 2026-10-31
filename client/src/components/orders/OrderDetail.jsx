import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import MessageThread from "../messaging/MessageThread";
import OrderStatusChip from "./OrderStatusChip";
import OrderMilestones from "./OrderMilestones";
import OrderFiles from "./OrderFiles";
import OrderActions from "./OrderActions";
import OrderReview from "./OrderReview";
import { conversationService } from "../../services/conversationService";
import { ORDER_STATUS, fullName, money } from "../../utils/format";

const PAYMENT_LINE = {
  held: ["lock", "Held in simulated escrow"],
  released: ["verified_user", "Released to seller"],
  refunded: ["undo", "Refunded to client"],
  pending: ["hourglass_top", "Payment pending"],
  failed: ["error", "Payment failed"],
};

export default function OrderDetail({ data, role, onChanged }) {
  const { order, payment, review, permissions } = data;
  const seller = order.freelancer;
  const client = order.client;
  const [conversationId, setConversationId] = useState(null);
  const [convoError, setConvoError] = useState("");

  useEffect(() => {
    let active = true;
    setConversationId(null);
    setConvoError("");
    conversationService
      .start({ orderId: order._id })
      .then((c) => active && setConversationId(c._id))
      .catch((err) => active && setConvoError(err.message));
    return () => {
      active = false;
    };
  }, [order._id]);

  // Order status changes appear inside the thread as system lines
  const events = useMemo(
    () =>
      order.statusHistory.map((h, i) => {
        let text = ORDER_STATUS[h.status].label.toUpperCase();
        if (h.note) text += `: ${h.note}`;
        if (h.status === "completed") text += ` (${money(order.price)} released from escrow)`;
        if (h.status === "cancelled") text += ` (${money(order.price)} refunded)`;
        return { id: i, at: h.at, text };
      }),
    [order]
  );

  const [payIcon, payText] = PAYMENT_LINE[payment?.status] || PAYMENT_LINE.pending;

  return (
    <div className="flex flex-col gap-space-md">
      {/* Header card */}
      <div className="bg-surface-container-lowest p-space-lg shadow-md flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-code-sm text-code-sm px-space-xs py-0.5 bg-surface-container font-bold text-on-surface">ID: {order.orderNumber}</span>
            <OrderStatusChip status={order.status} role={role} />
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            INITIATED: {new Date(order.createdAt).toISOString().replace("T", " // ").slice(0, 22)} UTC
          </span>
        </div>
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
            <Link to={`/gigs/${order.gig?._id}`} className="hover:text-primary">{order.gig?.title || order.packageSnapshot.title}</Link>
          </h2>
          <p className="font-code-sm text-code-sm text-on-surface-variant mt-1 uppercase">
            {order.packageTier} package // {order.packageSnapshot.title}
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm whitespace-pre-wrap">{order.requirements}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-low p-space-md">
          <div>
            <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block mb-1">Contractor (Seller)</span>
            <Link to={`/freelancers/${seller._id}`} className="flex items-center gap-space-xs">
              <Avatar user={seller} square className="w-8 h-8" />
              <span className="font-label-md text-label-md text-on-surface leading-tight hover:text-primary">{fullName(seller)}</span>
            </Link>
          </div>
          <div>
            <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block mb-1">Client (Buyer)</span>
            <div className="flex items-center gap-space-xs">
              <Avatar user={client} square className="w-8 h-8" />
              <div>
                <span className="font-label-md text-label-md text-on-surface block leading-tight">{client.companyName || fullName(client)}</span>
                {client.companyName && <span className="font-code-sm text-code-sm text-on-surface-variant">{fullName(client)}</span>}
              </div>
            </div>
          </div>
          <div>
            <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block mb-1">Vault Commitment</span>
            <div className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">{money(order.price)} USD</div>
            <span className="font-code-sm text-code-sm text-primary uppercase font-bold flex items-center gap-1">
              <Icon name={payIcon} className="text-body-sm" /> {payText}
            </span>
          </div>
        </div>
      </div>

      <OrderMilestones order={order} payment={payment} />
      <OrderFiles order={order} />
      {review && <OrderReview review={review} role={role} onChanged={onChanged} />}

      {/* Messaging + actions */}
      <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Contract Audit & Direct Messaging</h3>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 bg-primary" />
            <span className="font-code-sm text-code-sm text-primary font-bold">AUTO-REFRESH 10S</span>
          </div>
        </div>
        {convoError ? (
          <p role="alert" className="text-error font-body-md">{convoError}</p>
        ) : !conversationId ? (
          <p className="text-on-surface-variant font-body-sm">Opening conversation...</p>
        ) : (
          <MessageThread
            conversationId={conversationId}
            events={events}
            footerSlot={<OrderActions order={order} role={role} permissions={permissions} onChanged={onChanged} />}
          />
        )}
      </div>
    </div>
  );
}