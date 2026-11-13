import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import FieldError from "../ui/FieldError";
import { ghostBtn, inputCls, labelCls, primaryBtn } from "../ui/formStyles";
import { adminService } from "../../services/adminService";
import { refreshCategories } from "../../hooks/useCategories";

const NAME_RX = /^[A-Za-z0-9][A-Za-z0-9 &/,'().+-]*$/;
const clean = (s) => s.trim().replace(/\s+/g, " ");

export default function CategoryFormModal({ open, onClose, category, onSaved }) {
  const editing = Boolean(category);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: "", description: "" } });

  useEffect(() => {
    if (open) {
      reset({ name: category?.name || "", description: category?.description || "" });
      setServerError("");
    }
  }, [open, category, reset]);

  const onSubmit = async (v) => {
    setServerError("");
    const payload = { name: clean(v.name), description: v.description.trim() };
    try {
      if (editing) await adminService.updateCategory(category._id, payload);
      else await adminService.createCategory(payload);
      toast.success(editing ? "Category updated" : "Category added");
      refreshCategories();
      onClose();
      onSaved();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit category" : "Add category"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-space-lg space-y-space-md">
        <div>
          <label htmlFor="cat-name" className={labelCls}>Name</label>
          <input
            id="cat-name" autoComplete="off" className={inputCls(errors.name)}
            {...register("name", {
              validate: {
                required: (v) => clean(v).length > 0 || "Name is required",
                length: (v) => (clean(v).length >= 2 && clean(v).length <= 40) || "Name must be 2-40 characters",
                chars: (v) => NAME_RX.test(clean(v)) || "Use letters, numbers, spaces and & / , ' ( ) . + - only",
              },
            })}
          />
          <FieldError message={errors.name?.message} />
          {editing && (
            <p className="font-code-sm text-code-sm text-on-surface-variant mt-1">
              Link name: <code>{category.slug}</code>. It stays the same when you rename, so existing links keep working.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cat-description" className={labelCls}>Description (optional, shown on the category page)</label>
          <textarea
            id="cat-description" rows={3} maxLength={200} className={inputCls(errors.description)}
            {...register("description", { maxLength: { value: 200, message: "Maximum 200 characters" } })}
          />
          <FieldError message={errors.description?.message} />
        </div>

        {serverError && (
          <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={primaryBtn}>
            {isSubmitting ? "Saving..." : editing ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}