import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import { ghostBtn, inputCls, labelCls } from "../ui/formStyles";
import { adminService } from "../../services/adminService";
import { refreshCategories } from "../../hooks/useCategories";

export default function DeleteCategoryModal({ open, onClose, category, others, onDone }) {
  const [moveTo, setMoveTo] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMoveTo("");
      setReason("");
      setError("");
    }
  }, [open]);

  if (!category) return null;
  const needsMove = category.totalGigs > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (needsMove && !moveTo) return setError("Choose a category to move the gigs to");
    setBusy(true);
    setError("");
    try {
      const r = await adminService.deleteCategory(category._id, {
        moveTo: needsMove ? moveTo : undefined,
        reason: reason.trim() || undefined,
      });
      toast.success(r.movedGigs ? `Category deleted. ${r.movedGigs} gig${r.movedGigs === 1 ? "" : "s"} moved.` : "Category deleted");
      refreshCategories();
      onClose();
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete category" maxWidth="max-w-lg">
      <form onSubmit={submit} className="p-space-lg space-y-space-md">
        <p className="font-body-md text-body-md text-on-surface">
          Delete <strong>{category.name}</strong>?
        </p>
        {needsMove ? (
          <>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {category.totalGigs} gig{category.totalGigs === 1 ? "" : "s"} ({category.publishedGigs} published) use this category.
              They will be moved to the category you choose. Nothing else about them changes.
            </p>
            <div>
              <label htmlFor="move-to" className={labelCls}>Move gigs to *</label>
              <select id="move-to" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className={inputCls(false)}>
                <option value="">Select a category</option>
                {others.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No gigs use this category, so nothing needs to move.</p>
        )}
        <div>
          <label htmlFor="del-reason" className={labelCls}>Note for the activity log (optional)</label>
          <input id="del-reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={inputCls(false)} />
        </div>
        {error && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{error}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className={ghostBtn}>Keep category</button>
          <button type="submit" disabled={busy} className="px-space-lg py-2.5 bg-error text-on-error border border-error font-label-md text-label-md uppercase font-bold hover:opacity-90 disabled:opacity-60">
            {busy ? "Deleting..." : "Delete category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}