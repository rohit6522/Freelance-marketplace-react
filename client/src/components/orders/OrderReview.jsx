import StarRating from "../ui/StarRating";
import SellerReviewActions from "../reviews/SellerReviewActions";
import { shortDate } from "../../utils/format";

export default function OrderReview({ review, role, onChanged }) {
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

      {role === "freelancer" && <SellerReviewActions review={review} onChanged={onChanged} />}
    </div>
  );
}