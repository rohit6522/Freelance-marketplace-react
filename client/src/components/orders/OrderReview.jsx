import { useState } from "react";
import toast from "react-hot-toast";
import StarRating from "../ui/StarRating";
import TextActionModal from "../ui/TextActionModal";
import { reviewService } from "../../services/reviewService";
import { shortDate } from "../../utils/format";

export default function OrderReview({ review, role, onChanged }) {
  const [modal, setModal] = useState(null); // "reply" | "report"
  const isSeller = role === "freelancer";

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Client Review</h3>
        <span className="font-code-sm text-code-sm text-on-surface-variant">{shortDate(review.createdAt)}</span>
      </div>
      <StarRating value={review.rating} className="text-body-lg" />
      <p className="font-body-md text-body-md text-on-surface-variant">{review.comment}</p>

      {review.reply?.text && (
        <div className="bg-surface-container-low p-space-sm border-l-4 border-primary">
          <div className="font-label-sm text-label-sm uppercase font-bold text-primary mb-1">Seller response</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{review.reply.text}</p>
        </div>
      )}

      {isSeller && (
        <div className="flex gap-space-xs">
          {!review.reply?.text && (
            <button type="button" onClick={() => setModal("reply")} className="bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm uppercase px-space-md py-1.5 font-bold">
              Reply
            </button>
          )}
          <button type="button" onClick={() => setModal("report")} className="font-label-sm text-label-sm uppercase px-space-md py-1.5 text-on-surface-variant hover:text-error">
            Report review
          </button>
        </div>
      )}

      <TextActionModal
        open={modal === "reply"} onClose={() => setModal(null)} title="Reply to review"
        label="Your public reply *" minLength={2} maxLength={1000} submitLabel="Post reply"
        onSubmit={async (t) => { await reviewService.reply(review._id, t); toast.success("Reply posted"); onChanged(); }}
      />
      <TextActionModal
        open={modal === "report"} onClose={() => setModal(null)} title="Report review" tone="danger"
        description="Reports are stored for moderation."
        label="Why is this review inappropriate? *" maxLength={300} submitLabel="Submit report"
        onSubmit={async (t) => { await reviewService.report(review._id, t); toast.success("Report submitted"); }}
      />
    </div>
  );
}