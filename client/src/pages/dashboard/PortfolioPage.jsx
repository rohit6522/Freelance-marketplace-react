import { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import PortfolioFormModal from "../../components/dashboard/PortfolioFormModal";
import Modal from "../../components/ui/Modal";
import Icon from "../../components/ui/Icon";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { ghostBtn, primaryBtn } from "../../components/ui/formStyles";
import { useFetch } from "../../hooks/useFetch";
import { portfolioService } from "../../services/portfolioService";

export default function PortfolioPage() {
  const { data: projects, error, reload } = useFetch(() => portfolioService.mine(), []);
  const [editing, setEditing] = useState(null); // project object, or {} for a new one
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await portfolioService.remove(toDelete._id);
      toast.success("Project deleted");
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-space-lg">
      <PageHeader
        eyebrow="SELLER // PORTFOLIO" title="Portfolio"
        description="Showcase past work on your public profile."
        actions={<button type="button" onClick={() => setEditing({})} className={primaryBtn}>Add project</button>}
      />

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !projects ? (
        <SkeletonBlocks count={2} cols="grid-cols-1 md:grid-cols-2" height="h-64" />
      ) : projects.length === 0 ? (
        <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="collections" className="text-5xl text-outline" />
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-space-sm">No projects yet</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Add case studies so clients can see your work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {projects.map((p) => (
            <article key={p._id} className="bg-surface-container-lowest shadow-sm flex flex-col">
              <div className="h-44 bg-surface-container-high overflow-hidden relative">
                {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-outline"><Icon name="image" className="text-5xl" /></div>}
                {p.metric && <span className="absolute bottom-2 left-2 bg-on-surface text-surface px-2 py-0.5 font-code-sm text-code-sm uppercase">{p.metric}</span>}
              </div>
              <div className="p-space-md flex-1 flex flex-col gap-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">{p.title}</h3>
                <p className="font-code-sm text-code-sm text-on-surface-variant uppercase">
                  {[p.industry, p.durationWeeks && `${p.durationWeeks} weeks`, p.images?.length && `${p.images.length} images`].filter(Boolean).join(" // ")}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">{p.description}</p>
                <div className="mt-auto pt-space-sm flex gap-space-xs">
                  <button type="button" onClick={() => setEditing(p)} className="font-label-sm text-label-sm uppercase font-bold px-space-md py-1.5 border border-on-surface hover:bg-surface-container-high">Edit</button>
                  <button type="button" onClick={() => setToDelete(p)} className="font-label-sm text-label-sm uppercase font-bold px-space-md py-1.5 border border-error text-error hover:bg-error hover:text-on-error">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <PortfolioFormModal open={Boolean(editing)} onClose={() => setEditing(null)} project={editing?._id ? editing : null} onSaved={reload} />

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Delete project" maxWidth="max-w-md">
        <div className="p-space-lg space-y-space-md">
          <p className="font-body-md text-body-md text-on-surface">Delete <strong>{toDelete?.title}</strong> and its images from your portfolio?</p>
          <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
            <button type="button" onClick={() => setToDelete(null)} className={ghostBtn}>Keep</button>
            <button type="button" disabled={deleting} onClick={confirmDelete} className="px-space-lg py-2.5 bg-error text-on-error border border-error font-label-md text-label-md uppercase font-bold hover:opacity-90 disabled:opacity-60">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}