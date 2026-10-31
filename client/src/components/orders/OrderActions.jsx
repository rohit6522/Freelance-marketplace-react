import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "../ui/Icon";
import Modal from "../ui/Modal";
import TextActionModal from "../ui/TextActionModal";
import DeliverModal from "./DeliverModal";
import ReviewModal from "./ReviewModal";
import { orderService } from "../../services/orderService";
import { money } from "../../utils/format";

const ghost = "bg-surface-container-low hover:bg-error hover:text-on-error text-on-surface font-label-sm text-label-sm px-space-md py-2 uppercase transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed";
const solid = "bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm px-space-md py-2 uppercase transition-colors flex items-center gap-1 font-bold disabled:opacity-60";

export default function OrderActions({ order, role, permissions, onChanged }) {
  const [modal, setModal] = useState(null); // "revision" | "cancel" | "deliver" | "approve" | "review"
  const [busy, setBusy] = useState(false);
  const next = permissions.nextStatuses;
  const close = () => setModal(null);

  const run = async (fn, message) => {
    setBusy(true);
    try {
      await fn();
      toast.success(message);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isClient = role === "client";
  const noRevisions = permissions.revisionsLeft === 0;
  const cancelLabel = !isClient && order.status === "pending" ? "Reject Order" : "Cancel Order";
  const nothingToDo = next.length === 0 && !permissions.canReview;

  return (
    <div className="flex flex-col gap-space-sm pt-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          {!isClient && next.includes("in_progress") && (
            <button type="button" disabled={busy} onClick={() => run(() => orderService.accept(order._id), "Order accepted. The clock is running!")} className={solid}>
              <Icon name="task_alt" className="text-body-sm" /> Accept Order
            </button>
          )}
          {!isClient && next.includes("delivered") && (
            <button type="button" onClick={() => setModal("deliver")} className={solid}>
              <Icon name="upload" className="text-body-sm" /> {order.status === "revision_requested" ? "Submit Revision" : "Deliver Work"}
            </button>
          )}
          {isClient && next.includes("revision_requested") && (
            <button type="button" disabled={noRevisions} onClick={() => setModal("revision")} className={ghost} title={noRevisions ? "No revisions left on this package" : undefined}>
              <Icon name="assignment_return" className="text-body-sm" />
              {noRevisions ? "No Revisions Left" : "Request Revision"}
              {permissions.revisionsLeft != null && !noRevisions && <span className="font-code-sm normal-case">({permissions.revisionsLeft} left)</span>}
            </button>
          )}
          {isClient && next.includes("completed") && (
            <button type="button" onClick={() => setModal("approve")} className={solid}>
              <Icon name="check_circle" className="text-body-sm" /> Approve & Release Funds ({money(order.price)})
            </button>
          )}
          {next.includes("cancelled") && (
            <button type="button" onClick={() => setModal("cancel")} className={ghost}>
              <Icon name="cancel" className="text-body-sm" /> {cancelLabel}
            </button>
          )}
          {permissions.canReview && (
            <button type="button" onClick={() => setModal("review")} className={solid}>
              <Icon name="star" className="text-body-sm" /> Leave a Review
            </button>
          )}
          {nothingToDo && <span className="font-body-sm text-body-sm text-on-surface-variant">No actions available for this order right now.</span>}
        </div>
        <span className="font-code-sm text-code-sm text-on-surface-variant">SIMULATED ESCROW PROTOCOL</span>
      </div>

      <DeliverModal open={modal === "deliver"} onClose={close} order={order} onDone={onChanged} />
      <ReviewModal open={modal === "review"} onClose={close} orderId={order._id} onDone={onChanged} />

      <TextActionModal
        open={modal === "revision"} onClose={close} title="Request a revision"
        description={permissions.revisionsLeft == null ? "This package includes unlimited revisions." : `You have ${permissions.revisionsLeft} revision${permissions.revisionsLeft === 1 ? "" : "s"} left on this package.`}
        label="What should change? *" placeholder="Be specific so the seller can fix it in one round." maxLength={1000}
        submitLabel="Send revision request"
        onSubmit={async (text) => { await orderService.requestRevision(order._id, text); toast.success("Revision requested"); onChanged(); }}
      />
      <TextActionModal
        open={modal === "cancel"} onClose={close} title={cancelLabel} tone="danger"
        description={isClient ? "The held amount will be refunded to you (simulated)." : "The client will be refunded in full (simulated)."}
        label="Reason *" placeholder="Tell the other party why the order is being cancelled." maxLength={500}
        submitLabel={cancelLabel}
        onSubmit={async (text) => { await orderService.cancel(order._id, text); toast.success("Order cancelled and payment refunded"); onChanged(); }}
      />

      <Modal open={modal === "approve"} onClose={close} title="Approve & release funds" maxWidth="max-w-md">
        <div className="p-space-lg space-y-space-md">
          <p className="font-body-md text-body-md text-on-surface">
            Approve this delivery and release <strong>{money(order.price)}</strong> from the simulated escrow to the seller? This can't be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
            <button type="button" onClick={close} className="px-space-lg py-2.5 border border-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high">Not yet</button>
            <button
              type="button" disabled={busy}
              onClick={() => { close(); run(() => orderService.complete(order._id), "Funds released. Order completed!"); }}
              className="px-space-lg py-2.5 bg-primary text-on-primary border border-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container disabled:opacity-60"
            >
              Approve & release
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}