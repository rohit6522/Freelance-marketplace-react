import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import Modal from "../../components/ui/Modal";
import Icon from "../../components/ui/Icon";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { ghostBtn } from "../../components/ui/formStyles";
import { useFetch } from "../../hooks/useFetch";
import { gigService } from "../../services/gigService";
import { money, shortDate } from "../../utils/format";

const CHIP = {
  published: "bg-primary-container text-on-primary-container",
  draft: "bg-surface-container-high text-on-surface",
  paused: "bg-secondary-fixed text-on-surface",
};
const small = "font-label-sm text-label-sm uppercase font-bold px-space-sm py-1.5 border border-on-surface hover:bg-surface-container-high disabled:opacity-50";

export default function MyGigsPage() {
  const { data: gigs, error, reload } = useFetch(() => gigService.mine(), []);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const changeStatus = async (g, status, message) => {
    setBusyId(g._id);
    try {
      await gigService.setStatus(g._id, status);
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await gigService.remove(toDelete._id);
      toast.success("Gig deleted");
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(err.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const count = (s) => (s === "all" ? gigs?.length : gigs?.filter((g) => g.status === s).length) || 0;
  const shown = gigs ? gigs.filter((g) => filter === "all" || g.status === filter) : [];

  return (
    <div className="space-y-space-lg">
      <PageHeader
        eyebrow="SELLER // GIGS" title="My Gigs"
        description="Create, publish and manage your services."
        actions={
          <Link to="/dashboard/gigs/new" className="bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2.5 border border-primary hover:bg-primary-container">
            Create gig
          </Link>
        }
      />

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !gigs ? (
        <SkeletonBlocks count={3} height="h-28" />
      ) : gigs.length === 0 ? (
        <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="work" className="text-5xl text-outline" />
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-space-sm">No gigs yet</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Create your first gig to start receiving orders.</p>
          <Link to="/dashboard/gigs/new" className="inline-block mt-space-md bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2 border border-primary hover:bg-primary-container">
            Create gig
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-lowest p-space-xs shadow-sm" role="tablist" aria-label="Gig status">
            {[["all", "All"], ["published", "Published"], ["draft", "Drafts"], ["paused", "Paused"]].map(([key, label]) => (
              <button
                key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)}
                className={`px-space-md py-2 font-label-sm text-label-sm uppercase whitespace-nowrap ${filter === key ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-low text-on-surface hover:bg-surface-container"}`}
              >
                {label} ({count(key)})
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="bg-surface-container-lowest p-space-lg font-body-md text-on-surface-variant shadow-sm">No gigs with this status.</p>
          ) : (
            <ul className="space-y-space-sm">
              {shown.map((g) => (
                <li key={g._id} className="bg-surface-container-lowest p-space-md shadow-sm flex flex-col lg:flex-row gap-space-md lg:items-center">
                  <div className="flex items-center gap-space-md min-w-0 flex-1">
                    <div className="w-24 h-16 bg-surface-container-high shrink-0 overflow-hidden">
                      {g.images?.[0]?.url ? <img src={g.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-outline"><Icon name="image" /></div>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs mb-1">
                        <span className={`font-label-sm text-label-sm px-space-xs py-0.5 uppercase font-bold ${CHIP[g.status]}`}>{g.status}</span>
                        {g.category?.name && <span className="font-code-sm text-code-sm text-on-surface-variant uppercase">{g.category.name}</span>}
                      </div>
                      <h3 className="font-label-md text-label-md text-on-surface font-bold line-clamp-2">{g.title}</h3>
                      <p className="font-code-sm text-code-sm text-on-surface-variant uppercase mt-0.5">
                        from {money(g.startingPrice)} // {g.totalOrders} orders ({g.activeOrders} active) // {g.ratingCount ? `★ ${g.ratingAverage.toFixed(1)} (${g.ratingCount})` : "no reviews"} // updated {shortDate(g.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-space-xs lg:justify-end">
                    <Link to={`/dashboard/gigs/${g._id}/edit`} className={small}>Edit</Link>
                    <Link to={`/gigs/${g._id}`} className={small}>{g.status === "published" ? "View" : "Preview"}</Link>
                    {g.status !== "published" ? (
                      <button type="button" disabled={busyId === g._id} onClick={() => changeStatus(g, "published", "Gig published")} className={`${small} bg-primary text-on-primary border-primary hover:bg-primary-container`}>
                        Publish
                      </button>
                    ) : (
                      <button type="button" disabled={busyId === g._id} onClick={() => changeStatus(g, "paused", "Gig paused. It's hidden from the marketplace.")} className={small}>
                        Pause
                      </button>
                    )}
                    <button type="button" onClick={() => setToDelete(g)} className={`${small} text-error border-error hover:bg-error hover:text-on-error`}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Delete gig" maxWidth="max-w-md">
        <div className="p-space-lg space-y-space-md">
          <p className="font-body-md text-body-md text-on-surface">
            Permanently delete <strong>{toDelete?.title}</strong>? Gigs that already have orders can't be deleted, so pause them instead.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
            <button type="button" onClick={() => setToDelete(null)} className={ghostBtn}>Keep gig</button>
            <button type="button" disabled={deleting} onClick={confirmDelete} className="px-space-lg py-2.5 bg-error text-on-error border border-error font-label-md text-label-md uppercase font-bold hover:opacity-90 disabled:opacity-60">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}