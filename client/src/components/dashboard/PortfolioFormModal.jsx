import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import ImageUploader from "../ui/ImageUploader";
import FieldError from "../ui/FieldError";
import { ghostBtn, inputCls, labelCls, primaryBtn } from "../ui/formStyles";
import { portfolioService } from "../../services/portfolioService";

const URL_RX = /^https?:\/\/\S+\.\S+/i;
const splitList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

const toForm = (p) => ({
  title: p?.title || "", description: p?.description || "", industry: p?.industry || "",
  metric: p?.metric || "", durationWeeks: p?.durationWeeks || "",
  deliverables: (p?.deliverables || []).join(", "), externalLink: p?.externalLink || "",
});

export default function PortfolioFormModal({ open, onClose, project, onSaved }) {
  const [images, setImages] = useState([]);
  const [serverError, setServerError] = useState("");
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: toForm(null) });

  useEffect(() => {
    if (open) {
      reset(toForm(project));
      setImages(project?.images || []);
      setServerError("");
    }
  }, [open, project, reset]);

  const onSubmit = async (v) => {
    setServerError("");
    const payload = {
      title: v.title.trim(),
      description: v.description.trim(),
      industry: v.industry.trim(),
      metric: v.metric.trim(),
      durationWeeks: v.durationWeeks === "" ? null : Number(v.durationWeeks),
      deliverables: splitList(v.deliverables),
      externalLink: v.externalLink.trim(),
      images: images.map(({ url, publicId }) => ({ url, publicId })),
    };
    try {
      if (project) await portfolioService.update(project._id, payload);
      else await portfolioService.create(payload);
      toast.success(project ? "Project updated" : "Project added");
      onClose();
      onSaved();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Edit project" : "Add project"} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-space-lg space-y-space-md">
        <div>
          <label htmlFor="pf-title" className={labelCls}>Title *</label>
          <input id="pf-title" className={inputCls(errors.title)} {...register("title", { required: "Title is required", minLength: { value: 3, message: "At least 3 characters" }, maxLength: { value: 120, message: "Maximum 120 characters" } })} />
          <FieldError message={errors.title?.message} />
        </div>
        <div>
          <label htmlFor="pf-desc" className={labelCls}>Description *</label>
          <textarea id="pf-desc" rows={4} className={inputCls(errors.description)} {...register("description", { required: "Description is required", minLength: { value: 10, message: "At least 10 characters" }, maxLength: { value: 2000, message: "Maximum 2000 characters" } })} />
          <FieldError message={errors.description?.message} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          <div>
            <label htmlFor="pf-industry" className={labelCls}>Industry</label>
            <input id="pf-industry" placeholder="Fintech" className={inputCls(errors.industry)} {...register("industry", { maxLength: { value: 60, message: "Maximum 60 characters" } })} />
            <FieldError message={errors.industry?.message} />
          </div>
          <div>
            <label htmlFor="pf-metric" className={labelCls}>Key result</label>
            <input id="pf-metric" placeholder="+62% onboarding completion" className={inputCls(errors.metric)} {...register("metric", { maxLength: { value: 100, message: "Maximum 100 characters" } })} />
            <FieldError message={errors.metric?.message} />
          </div>
          <div>
            <label htmlFor="pf-weeks" className={labelCls}>Duration (weeks)</label>
            <input id="pf-weeks" type="number" min="1" max="520" className={inputCls(errors.durationWeeks)} {...register("durationWeeks", { min: { value: 1, message: "Minimum 1" }, max: { value: 520, message: "Maximum 520" } })} />
            <FieldError message={errors.durationWeeks?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="pf-deliverables" className={labelCls}>Key deliverables (comma separated, up to 10)</label>
          <input
            id="pf-deliverables" className={inputCls(errors.deliverables)}
            {...register("deliverables", {
              validate: (v) => {
                const l = splitList(v);
                if (l.length > 10) return "A maximum of 10 deliverables";
                if (l.some((d) => d.length > 80)) return "Each deliverable must be 80 characters or fewer";
                return true;
              },
            })}
          />
          <FieldError message={errors.deliverables?.message} />
        </div>
        <div>
          <label htmlFor="pf-link" className={labelCls}>Project link (optional)</label>
          <input id="pf-link" type="url" placeholder="https://..." className={inputCls(errors.externalLink)} {...register("externalLink", { validate: (v) => !v.trim() || URL_RX.test(v.trim()) || "Enter a full link starting with http:// or https://" })} />
          <FieldError message={errors.externalLink?.message} />
        </div>
        <div>
          <span className={labelCls}>Images (up to 6)</span>
          <ImageUploader images={images} onChange={setImages} max={6} purpose="portfolio" />
        </div>
        {serverError && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={primaryBtn}>{isSubmitting ? "Saving..." : project ? "Save project" : "Add project"}</button>
        </div>
      </form>
    </Modal>
  );
}