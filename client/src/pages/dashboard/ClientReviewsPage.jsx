import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import SectionCard from "../../components/dashboard/SectionCard";
import ReviewModal from "../../components/orders/ReviewModal";
import Avatar from "../../components/ui/Avatar";
import StarRating from "../../components/ui/StarRating";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { useFetch } from "../../hooks/useFetch";
import { reviewService } from "../../services/reviewService";
import { dayMonth, fullName, money, shortDate } from "../../utils/format";

export default function ClientReviewsPage() {
  const { data, error, reload } = useFetch(() => reviewService.mine(), []);
  const [reviewOrder, setReviewOrder] = useState(null);

  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="CLIENT // REVIEWS" title="My Reviews" description="Review completed orders and see what you've written." />
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <SkeletonBlocks count={3} />
      ) : (
        <>
          <SectionCard title={`Waiting for your review (${data.pending.length})`} description="Completed orders you haven't reviewed yet.">
            {data.pending.length === 0 ? (
              <p className="font-body-md text-on-surface-variant">You're all caught up.</p>
            ) : (
              <ul className="divide-y divide-outline-variant">
                {data.pending.map((o) => (
                  <li key={o._id} className="py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm min-w-0">
                      <Avatar user={o.freelancer} square className="w-9 h-9" />
                      <div className="min-w-0">
                        <div className="font-label-md text-label-md text-on-surface font-bold truncate">{o.gig?.title}</div>
                        <div className="font-code-sm text-code-sm text-on-surface-variant">
                          #{o.orderNumber} // {fullName(o.freelancer)} // {money(o.price)} // closed {dayMonth(o.completedAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button" onClick={() => setReviewOrder(o._id)}
                      className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2 hover:bg-primary-container"
                    >
                      Write review
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={`Reviews I've written (${data.reviews.length})`}>
            {data.reviews.length === 0 ? (
              <p className="font-body-md text-on-surface-variant">You haven't written any reviews yet.</p>
            ) : (
              <div className="space-y-space-md">
                {data.reviews.map((r) => (
                  <article key={r._id} className="bg-surface-container-low p-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-xs">
                      <Link to={`/gigs/${r.gig?._id}`} className="font-label-md text-label-md text-on-surface font-bold hover:text-primary">{r.gig?.title}</Link>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">{shortDate(r.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-space-sm mb-space-xs">
                      <StarRating value={r.rating} />
                      <span className="font-code-sm text-code-sm text-on-surface-variant">for {fullName(r.freelancer)}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">{r.comment}</p>
                    {r.reply?.text && (
                      <div className="mt-space-sm bg-surface-container-lowest p-space-sm border-l-4 border-primary">
                        <div className="font-label-sm text-label-sm uppercase font-bold text-primary mb-1">Seller response</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{r.reply.text}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}
      <ReviewModal open={Boolean(reviewOrder)} onClose={() => setReviewOrder(null)} orderId={reviewOrder} onDone={reload} />
    </div>
  );
}