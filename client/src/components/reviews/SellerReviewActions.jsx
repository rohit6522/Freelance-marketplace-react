import { useState } from "react";
import toast from "react-hot-toast";
import TextActionModal from "../ui/TextActionModal";
import { reviewService } from "../../services/reviewService";

export default function SellerReviewActions({ review, onChanged }) {
  const [modal, setModal] = useState(null); // "reply" | "report"

  return (
    <>
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
    </>
  );
}