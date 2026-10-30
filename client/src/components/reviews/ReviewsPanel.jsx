import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import Pagination from "../ui/Pagination";
import StarRating from "../ui/StarRating";
import { reviewService } from "../../services/reviewService";
import { fullName, publicName, shortDate } from "../../utils/format";

const SORTS = [["recent", "Recent"], ["highest", "Highest"], ["lowest", "Lowest"]];
const BAR_COLORS = { 5: "bg-primary", 4: "bg-primary-fixed-dim", 3: "bg-secondary", 2: "bg-secondary", 1: "bg-error" };

// scope: { gig: id } or { freelancer: userId }
export default function ReviewsPanel({ scope, showGigTitle = false }) {
  const scopeKey = JSON.stringify(scope);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => setPage(1), [scopeKey, sort]);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    reviewService
      .list({ ...scope, sort, page, limit: 5 })
      .then((data) => active && setState({ loading: false, error: "", data }))
      .catch((err) => active && setState({ loading: false, error: err.message, data: null }));
    return () => {
      active = false;
    };
  }, [scopeKey, sort, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const { loading, error, data } = state;
  if (error) return <p role="alert" className="text-error font-body-md">{error}</p>;
  if (!data) return <p className="text-on-surface-variant font-body-md">Loading reviews...</p>;

  const { summary, reviews, pagination } = data;
  if (summary.count === 0) {
    return (
      <div className="bg-surface-container-low p-space-lg text-center">
        <Icon name="rate_review" className="text-4xl text-outline" />
        <p className="font-body-md text-on-surface-variant mt-space-xs">No reviews yet. Reviews appear after a completed order.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg bg-surface-container-low p-space-lg mb-space-lg items-center">
        <div className="md:col-span-4 text-center md:text-left">
          <div className="font-headline-xl text-headline-xl text-primary font-bold leading-none">{summary.average.toFixed(1)}</div>
          <div className="my-space-xs flex justify-center md:justify-start">
            <StarRating value={summary.average} className="text-body-lg" />
          </div>
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
            {summary.count} verified order {summary.count === 1 ? "review" : "reviews"}
          </div>
        </div>
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = Math.round((summary.distribution[star] / summary.count) * 100);
            return (
              <div key={star} className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface">
                <span className="w-8 font-bold">{star} ★</span>
                <div className="flex-1 h-3 bg-surface-container-highest">
                  <div className={`h-full ${BAR_COLORS[star]}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-right font-code-sm text-code-sm text-on-surface-variant font-bold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1 font-label-sm text-label-sm uppercase font-bold mb-space-lg overflow-x-auto">
        <span className="text-on-surface-variant mr-1">Sort:</span>
        {SORTS.map(([key, label]) => (
          <button
            key={key} type="button" onClick={() => setSort(key)} aria-pressed={sort === key}
            className={`px-space-sm py-1 ${sort === key ? "bg-on-surface text-surface" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`space-y-space-lg ${loading ? "opacity-60" : ""}`}>
        {reviews.map((r) => (
          <article key={r._id} className="bg-surface-container-low p-space-md">
            <div className="flex items-start justify-between gap-space-md mb-space-sm">
              <div className="flex items-center gap-space-md">
                <Avatar user={r.client} square className="w-10 h-10" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-headline-sm text-body-md font-bold text-on-surface">{publicName(r.client)}</span>
                    <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-1 font-bold">VERIFIED ORDER</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating value={r.rating} />
                    <span className="font-code-sm text-code-sm text-on-surface-variant">{shortDate(r.createdAt)}</span>
                  </div>
                </div>
              </div>
              {showGigTitle && r.gig?.title && (
                <span className="hidden sm:block font-code-sm text-code-sm text-on-surface-variant text-right max-w-[14rem] truncate">
                  {r.gig.title}
                </span>
              )}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{r.comment}</p>
            {r.reply?.text && (
              <div className="mt-space-md bg-surface-container-lowest p-space-sm border-l-4 border-primary">
                <div className="font-label-sm text-label-sm uppercase font-bold text-primary mb-1">Seller response</div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{r.reply.text}</p>
              </div>
            )}
          </article>
        ))}
      </div>

      <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} unit="REVIEWS" onChange={setPage} />
    </div>
  );
}