import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import Pagination from "../../components/ui/Pagination";
import StarRating from "../../components/ui/StarRating";
import TextActionModal from "../../components/ui/TextActionModal";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import Icon from "../../components/ui/Icon";
import { useFetch } from "../../hooks/useFetch";
import { adminService } from "../../services/adminService";
import { fullName, shortDate } from "../../utils/format";

const TABS = [["reported", "Reported"], ["hidden", "Hidden"], ["all", "All reviews"]];
const btn = "font-label-sm text-label-sm uppercase font-bold px-space-md py-1.5 border";

const ACTIONS = {
  hide: { title: "Hide review", label: "Reason (saved in the activity log) *", minLength: 5, submit: "Hide review", tone: "danger", done: "Review hidden. Ratings recalculated.", run: (r, t) => adminService.setReviewHidden(r._id, true, t) },
  restore: { title: "Restore review", label: "Note (optional)", minLength: 0, submit: "Restore review", tone: "primary", done: "Review restored. Ratings recalculated.", run: (r, t) => adminService.setReviewHidden(r._id, false, t) },
  dismiss: { title: "Dismiss reports", label: "Note (optional)", minLength: 0, submit: "Dismiss reports", tone: "primary", done: "Reports dismissed", run: (r, t) => adminService.dismissReports(r._id, t) },
};

export default function ModerationPage() {
  const [filter, setFilter] = useState("reported");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null); // { type, review }
  const { data, error, reload } = useFetch(() => adminService.reviews({ filter, page, limit: 8 }), [filter, page]);
  const cfg = action ? ACTIONS[action.type] : ACTIONS.hide;

  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="ADMIN // MODERATION" title="Review Moderation" description="Review reports, hide or restore reviews. Ratings update automatically. Every action is logged." />

      <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-lowest p-space-xs shadow-sm" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key} type="button" role="tab" aria-selected={filter === key}
            onClick={() => { setFilter(key); setPage(1); }}
            className={`px-space-md py-2 font-label-sm text-label-sm uppercase whitespace-nowrap ${filter === key ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-low text-on-surface hover:bg-surface-container"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <SkeletonBlocks count={3} height="h-48" />
      ) : data.reviews.length === 0 ? (
        <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="task_alt" className="text-5xl text-outline" />
          <p className="font-body-md text-on-surface-variant mt-space-sm">
            {filter === "reported" ? "No reviews are waiting for moderation." : "Nothing to show here."}
          </p>
        </div>
      ) : (
        <div className="space-y-space-md">
          {data.reviews.map((r) => (
            <article key={r._id} className="bg-surface-container-lowest p-space-lg shadow-sm space-y-space-sm">
              <div className="flex flex-wrap items-start justify-between gap-space-sm">
                <div>
                  <Link to={`/gigs/${r.gig?._id}`} className="font-label-md text-label-md text-on-surface font-bold hover:text-primary">{r.gig?.title || "Deleted gig"}</Link>
                  <p className="font-code-sm text-code-sm text-on-surface-variant mt-0.5">
                    {shortDate(r.createdAt)} // by {fullName(r.client)} ({r.client?.email}) // about {fullName(r.freelancer)}
                  </p>
                </div>
                <div className="flex items-center gap-space-xs">
                  {r.isHidden && <span className="font-label-sm text-label-sm uppercase font-bold bg-surface-dim px-space-xs py-0.5">Hidden</span>}
                  <StarRating value={r.rating} />
                </div>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">{r.comment}</p>
              {r.reply?.text && (
                <p className="bg-surface-container-low p-space-sm border-l-4 border-primary font-body-sm text-body-sm text-on-surface-variant">
                  <strong className="text-primary uppercase font-label-sm">Seller reply: </strong>{r.reply.text}
                </p>
              )}

              {r.reports?.length > 0 && (
                <div className="bg-error-container/40 p-space-sm space-y-1">
                  <div className="font-label-sm text-label-sm uppercase font-bold text-on-error-container">{r.reports.length} {r.reports.length === 1 ? "report" : "reports"}</div>
                  {r.reports.map((rep, i) => (
                    <p key={i} className="font-body-sm text-body-sm text-on-surface">
                      <strong>{rep.user ? fullName(rep.user) : "Deleted user"}</strong>: {rep.reason}
                      <span className="font-code-sm text-code-sm text-on-surface-variant"> // {shortDate(rep.at)}</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-space-xs pt-space-xs">
                {!r.isHidden && (
                  <button type="button" onClick={() => setAction({ type: "hide", review: r })} className={`${btn} border-error text-error hover:bg-error hover:text-on-error`}>Hide review</button>
                )}
                {r.isHidden && (
                  <button type="button" onClick={() => setAction({ type: "restore", review: r })} className={`${btn} border-on-surface hover:bg-surface-container-high`}>Restore review</button>
                )}
                {r.reports?.length > 0 && (
                  <button type="button" onClick={() => setAction({ type: "dismiss", review: r })} className={`${btn} border-on-surface hover:bg-surface-container-high`}>Dismiss reports</button>
                )}
              </div>
            </article>
          ))}
          <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} unit="REVIEWS" onChange={setPage} />
        </div>
      )}

      <TextActionModal
        open={Boolean(action)} onClose={() => setAction(null)}
        title={cfg.title} label={cfg.label} minLength={cfg.minLength} maxLength={500}
        submitLabel={cfg.submit} tone={cfg.tone}
        onSubmit={async (text) => {
          await cfg.run(action.review, text);
          toast.success(cfg.done);
          reload();
        }}
      />
    </div>
  );
}