import { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import CategoryFormModal from "../../components/dashboard/CategoryFormModal";
import DeleteCategoryModal from "../../components/dashboard/DeleteCategoryModal";
import Icon from "../../components/ui/Icon";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { primaryBtn } from "../../components/ui/formStyles";
import { useFetch } from "../../hooks/useFetch";
import { refreshCategories } from "../../hooks/useCategories";
import { adminService } from "../../services/adminService";

export default function AdminCategoriesPage() {
  const { data: categories, error, reload } = useFetch(() => adminService.categories(), []);
  const [editing, setEditing] = useState(null); // a category, or {} for a new one
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const move = async (index, delta) => {
    const ids = categories.map((c) => c._id);
    const target = index + delta;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy(true);
    try {
      await adminService.reorderCategories(ids);
      refreshCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      reload();
    }
  };

  const iconBtn = "p-1 border border-outline-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed";
  const textBtn = "font-label-sm text-label-sm uppercase font-bold px-space-md py-1.5 border";

  return (
    <div className="space-y-space-lg">
      <PageHeader
        eyebrow="ADMIN // CATEGORIES" title="Categories"
        description="Add, rename and reorder the categories sellers and buyers use. Renaming keeps each category's link."
        actions={<button type="button" onClick={() => setEditing({})} className={primaryBtn}>Add category</button>}
      />

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !categories ? (
        <SkeletonBlocks count={4} height="h-14" />
      ) : (
        <div className="bg-surface-container-lowest shadow-sm overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm min-w-[44rem]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase text-on-surface-variant">
                {["Order", "Category", "Link name", "Gigs", ""].map((h) => <th key={h} className="p-space-sm">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c._id} className="border-t border-outline-variant align-top">
                  <td className="p-space-sm whitespace-nowrap">
                    <div className="flex gap-1">
                      <button type="button" aria-label={`Move ${c.name} up`} disabled={busy || i === 0} onClick={() => move(i, -1)} className={iconBtn}>
                        <Icon name="arrow_upward" className="text-base" />
                      </button>
                      <button type="button" aria-label={`Move ${c.name} down`} disabled={busy || i === categories.length - 1} onClick={() => move(i, 1)} className={iconBtn}>
                        <Icon name="arrow_downward" className="text-base" />
                      </button>
                    </div>
                  </td>
                  <td className="p-space-sm">
                    <div className="font-bold text-on-surface">{c.name}</div>
                    {c.description && <div className="text-on-surface-variant max-w-md">{c.description}</div>}
                  </td>
                  <td className="p-space-sm font-code-sm text-code-sm text-on-surface-variant">{c.slug}</td>
                  <td className="p-space-sm whitespace-nowrap">{c.publishedGigs} published / {c.totalGigs} total</td>
                  <td className="p-space-sm text-right whitespace-nowrap">
                    <button type="button" onClick={() => setEditing(c)} className={`${textBtn} border-on-surface hover:bg-surface-container-high mr-space-xs`}>Edit</button>
                    <button
                      type="button" disabled={categories.length <= 1} onClick={() => setToDelete(c)}
                      title={categories.length <= 1 ? "At least one category must exist" : undefined}
                      className={`${textBtn} border-error text-error hover:bg-error hover:text-on-error disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormModal open={Boolean(editing)} onClose={() => setEditing(null)} category={editing?._id ? editing : null} onSaved={reload} />
      <DeleteCategoryModal
        open={Boolean(toDelete)} onClose={() => setToDelete(null)} category={toDelete}
        others={(categories || []).filter((c) => c._id !== toDelete?._id)} onDone={reload}
      />
    </div>
  );
}