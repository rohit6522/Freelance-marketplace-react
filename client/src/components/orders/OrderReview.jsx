import { useState } from "react";
import StarRating from "../ui/StarRating";
import SellerReviewActions from "../reviews/SellerReviewActions";
import ReviewModal from "./ReviewModal";
import Icon from "../ui/Icon";
import { shortDate } from "../../utils/format";

export default function OrderReview({ review, role, onChanged }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Client Review</h3>
          {review.editedAt && (
            <span className="font-code-sm text-code-sm text-secondary italic">(edited)</span>
          )}
        </div>
        <div className="flex items-center gap-space-sm">
          <span className="font-code-sm text-code-sm text-on-surface-variant">{shortDate(review.createdAt)}</span>
          {role === "client" && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-label-sm text-label-sm uppercase font-bold text-primary hover:text-primary-container px-2 py-0.5 border border-primary hover:bg-surface-container-high transition-colors flex items-center gap-1"
            >
              <Icon name="edit" className="text-xs" /> Edit
            </button>
          )}
        </div>
      </div>
      <StarRating value={review.rating} className="text-body-lg" />
      <p className="font-body-md text-body-md text-on-surface-variant">{review.comment}</p>

      {review.reply?.text && (
        <div className="bg-surface-container-low p-space-sm border-l-4 border-primary">
          <div className="font-label-sm text-label-sm uppercase font-bold text-primary mb-1">Seller response</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{review.reply.text}</p>
        </div>
      )}

      {role === "freelancer" && <SellerReviewActions review={review} onChanged={onChanged} />}

      {role === "client" && (
        <ReviewModal
          open={editing}
          onClose={() => setEditing(false)}
          initialReview={review}
          onDone={() => {
            setEditing(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}