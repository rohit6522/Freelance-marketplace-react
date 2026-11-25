import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import Pagination from "../../components/ui/Pagination";
import TextActionModal from "../../components/ui/TextActionModal";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import Icon from "../../components/ui/Icon";
import { useFetch } from "../../hooks/useFetch";
import { adminService } from "../../services/adminService";
import { money, shortDate, fullName } from "../../utils/format";

const TABS = [
  ["open", "Open Disputes"],
  ["resolved", "Resolved"],
  ["all", "All Disputes"],
];

const RESOLVE_ACTIONS = {
  refund: {
    title: "Admin Refund to Client",
    description: "The order will be cancelled and the full payment in escrow will be refunded to the client. This cannot be undone.",
    label: "Resolution note (sent to client and seller) *",
    minLength: 5,
    submit: "Confirm Refund",
    tone: "danger",
    successMsg: "Payment refunded to client. Dispute resolved.",
  },
  release: {
    title: "Release Escrow to Freelancer",
    description: "The order will be marked complete and the payment held in escrow will be released to the freelancer. This cannot be undone.",
    label: "Resolution note (sent to client and seller) *",
    minLength: 5,
    submit: "Release Payment",
    tone: "primary",
    successMsg: "Funds released to freelancer. Dispute resolved.",
  },
  dismiss: {
    title: "Dismiss Dispute (Resume Order)",
    description: "The dispute will be closed and the order will return to its previous active state so client and seller can continue working.",
    label: "Reason for dismissal (optional)",
    minLength: 0,
    submit: "Dismiss Dispute",
    tone: "primary",
    successMsg: "Dispute dismissed. Order resumed.",
  },
};

export default function AdminDisputesPage() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null); // { type: "refund" | "release" | "dismiss", order }

  const { data, error, reload } = useFetch(
    () => adminService.disputes({ status, page, limit: 10 }),
    [status, page]
  );

  const cfg = action ? RESOLVE_ACTIONS[action.type] : RESOLVE_ACTIONS.refund;

  const handleResolve = async (note) => {
    if (!action) return;
    try {
      await adminService.resolveDispute(action.order._id, {
        action: action.type,
        note,
      });
      toast.success(cfg.successMsg);
      setAction(null);
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to resolve dispute");
    }
  };

  return (
    <div className="space-y-space-lg">
      <PageHeader
        eyebrow="ADMIN // DISPUTES"
        title="Dispute Resolution & Escrow Refunds"
        description="Review escalated orders, arbitrate client-freelancer issues, and refund or release held escrow funds."
      />

      <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-lowest p-space-xs shadow-sm" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
            className={`px-space-md py-2 font-label-sm text-label-sm uppercase whitespace-nowrap transition-colors ${
              status === key
                ? "bg-on-surface text-surface-container-lowest font-bold"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <SkeletonBlocks count={3} height="h-44" />
      ) : data.orders.length === 0 ? (
        <div className="p-space-xl bg-surface-container-lowest border border-outline-variant text-center space-y-2">
          <Icon name="check_circle" className="text-4xl text-primary mx-auto" />
          <h2 className="font-title-md text-title-md text-on-surface">No {status} disputes</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {status === "open"
              ? "All active orders are running smoothly without any open disputes."
              : "No dispute history matching this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-space-md">
          {data.orders.map((order) => {
            const isOpen = order.status === "disputed" || order.dispute?.status === "open";
            const raisedByRole =
              String(order.dispute?.raisedBy?._id || order.dispute?.raisedBy) === String(order.client?._id)
                ? "Client"
                : "Freelancer";

            return (
              <div
                key={order._id}
                className="p-space-md sm:p-space-lg bg-surface-container-lowest border border-outline-variant space-y-space-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-space-sm border-b border-outline-variant/60 pb-space-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-code-md text-code-md font-bold text-primary">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-label-xs text-label-xs uppercase font-bold border ${
                          isOpen
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/40"
                            : order.dispute?.status === "resolved_refunded"
                            ? "bg-error/10 text-error border-error/30"
                            : order.dispute?.status === "resolved_released"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-surface-container text-on-surface-variant border-outline-variant"
                        }`}
                      >
                        {isOpen
                          ? "DISPUTE OPEN"
                          : order.dispute?.status === "resolved_refunded"
                          ? "REFUNDED TO CLIENT"
                          : order.dispute?.status === "resolved_released"
                          ? "RELEASED TO FREELANCER"
                          : "DISMISSED"}
                      </span>
                    </div>
                    <h3 className="font-title-sm text-title-sm text-on-surface mt-1">
                      {order.gig?.title || order.packageSnapshot?.title || "Custom Order"}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="font-title-md text-title-md font-bold text-on-surface">
                      {money(order.price)}
                    </span>
                    <p className="font-code-xs text-code-xs text-on-surface-variant">
                      Escrow: {order.status === "cancelled" ? "Refunded" : order.status === "completed" ? "Released" : "Frozen"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-body-sm text-on-surface-variant">
                  <div className="p-3 bg-surface-container-low border border-outline-variant/40 space-y-1">
                    <p className="font-label-xs uppercase text-on-surface font-bold">Client</p>
                    <p className="text-on-surface font-medium">{fullName(order.client)}</p>
                    <p className="font-code-xs text-code-xs">{order.client?.email}</p>
                  </div>
                  <div className="p-3 bg-surface-container-low border border-outline-variant/40 space-y-1">
                    <p className="font-label-xs uppercase text-on-surface font-bold">Freelancer</p>
                    <p className="text-on-surface font-medium">{fullName(order.freelancer)}</p>
                    <p className="font-code-xs text-code-xs">{order.freelancer?.email}</p>
                  </div>
                </div>

                {order.dispute && (
                  <div className="p-space-md bg-amber-500/5 border-l-4 border-amber-500 space-y-2">
                    <div className="flex items-center justify-between font-label-xs text-label-xs uppercase">
                      <span className="text-amber-300 font-bold">
                        Dispute Raised by {raisedByRole} ({fullName(order.dispute.raisedBy)})
                      </span>
                      <span className="font-code-xs text-on-surface-variant">
                        {order.dispute.raisedAt ? shortDate(order.dispute.raisedAt) : ""}
                      </span>
                    </div>
                    <blockquote className="font-body-sm text-body-sm text-on-surface italic">
                      "{order.dispute.reason}"
                    </blockquote>
                    {order.dispute.resolutionNote && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 font-body-sm text-body-sm">
                        <strong className="text-primary font-label-xs uppercase block">Admin Resolution Note:</strong>
                        <span>{order.dispute.resolutionNote}</span>
                      </div>
                    )}
                  </div>
                )}

                {isOpen && (
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-outline-variant/60">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <button
                        type="button"
                        onClick={() => setAction({ type: "refund", order })}
                        className="font-label-sm text-label-sm uppercase font-bold px-3 py-1.5 bg-error text-on-error hover:bg-error-container flex items-center gap-1"
                      >
                        <Icon name="currency_exchange" className="text-body-sm" /> Refund Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction({ type: "release", order })}
                        className="font-label-sm text-label-sm uppercase font-bold px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container flex items-center gap-1"
                      >
                        <Icon name="paid" className="text-body-sm" /> Release to Freelancer
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction({ type: "dismiss", order })}
                        className="font-label-sm text-label-sm uppercase font-bold px-3 py-1.5 bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant flex items-center gap-1"
                      >
                        <Icon name="close" className="text-body-sm" /> Dismiss Dispute
                      </button>
                    </div>

                    <Link
                      to={`/orders`}
                      className="font-label-xs text-label-xs uppercase font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View in Orders <Icon name="arrow_forward" className="text-code-xs" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {action && (
        <TextActionModal
          open={Boolean(action)}
          onClose={() => setAction(null)}
          title={cfg.title}
          description={cfg.description}
          label={cfg.label}
          minLength={cfg.minLength}
          maxLength={1000}
          submitLabel={cfg.submit}
          tone={cfg.tone}
          onSubmit={handleResolve}
        />
      )}
    </div>
  );
}
