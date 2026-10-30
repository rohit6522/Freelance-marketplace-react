import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Icon from "../ui/Icon";
import FieldError from "../ui/FieldError";
import { orderService } from "../../services/orderService";
import { uploadService } from "../../services/uploadService";
import { daysLabel, money, revisionsLabel, TIER_LABELS } from "../../utils/format";

export default function CheckoutModal({ open, onClose, gig, tier }) {
  const navigate = useNavigate();
  const pkg = gig.packages[tier];
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { requirements: "" } });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (files.length >= 5) return toast.error("You can attach up to 5 files");
    setUploading(true);
    try {
      const uploaded = await uploadService.file(file);
      setFiles((list) => [...list, uploaded]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async ({ requirements }) => {
    setServerError("");
    try {
      const { order } = await orderService.create({
        gigId: gig._id,
        tier,
        requirements: requirements.trim(),
        attachments: files.map(({ url, name, size, publicId }) => ({ url, name, size, publicId })),
      });
      toast.success(`Order ${order.orderNumber} placed (simulated payment)`);
      onClose();
      navigate("/orders");
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Order summary & requirements">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-space-lg space-y-space-md">
        <div className="bg-surface-container-low p-space-md">
          <div className="flex items-start justify-between gap-space-md">
            <div>
              <div className="font-code-sm text-code-sm text-on-surface-variant uppercase">{TIER_LABELS[tier]} package</div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold">{pkg.title}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">{gig.title}</div>
            </div>
            <div className="font-headline-lg text-headline-lg text-primary font-bold">{money(pkg.price)}</div>
          </div>
          <div className="mt-space-sm pt-space-sm border-t border-outline-variant flex flex-wrap gap-x-space-lg gap-y-1 font-code-sm text-code-sm text-on-surface">
            <span>DELIVERY: <strong>{daysLabel(pkg.deliveryDays)}</strong></span>
            <span>REVISIONS: <strong>{revisionsLabel(pkg.revisions)}</strong></span>
          </div>
        </div>

        <div>
          <label htmlFor="requirements" className="block font-label-md text-label-md text-on-surface mb-1">
            Project requirements <span className="text-primary font-bold">*</span>
          </label>
          <textarea
            id="requirements" rows={5} maxLength={5000}
            placeholder="Describe what you need, your goals, tools or links the seller should know about..."
            aria-invalid={Boolean(errors.requirements)}
            className={`w-full px-space-md py-2.5 bg-surface-container-lowest border font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none ${errors.requirements ? "border-error" : "border-outline"}`}
            {...register("requirements", {
              required: "Please describe your project",
              minLength: { value: 20, message: "Please write at least 20 characters" },
              maxLength: { value: 5000, message: "Maximum 5000 characters" },
              validate: (v) => v.trim().length >= 20 || "Please write at least 20 characters",
            })}
          />
          <FieldError message={errors.requirements?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-label-md text-on-surface">Attachments (optional)</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">{files.length}/5</span>
          </div>
          {files.length > 0 && (
            <ul className="mb-space-xs space-y-1">
              {files.map((f, i) => (
                <li key={f.publicId || f.url} className="flex items-center justify-between bg-surface-container-low px-space-sm py-1 font-code-sm text-code-sm">
                  <span className="truncate">{f.name}</span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((l) => l.filter((_, idx) => idx !== i))} className="text-on-surface hover:text-error">
                    <Icon name="close" className="text-base" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="inline-flex items-center gap-1.5 px-space-md py-2 border border-on-surface bg-surface-container-lowest font-label-sm text-label-sm uppercase font-bold cursor-pointer hover:bg-surface-container-high">
            <Icon name={uploading ? "sync" : "attach_file"} className={`text-base ${uploading ? "animate-spin" : ""}`} />
            {uploading ? "Uploading..." : "Attach file"}
            <input type="file" className="sr-only" onChange={handleFile} disabled={uploading} accept=".jpg,.jpeg,.png,.webp,.pdf,.zip,.json,.txt,.md" />
          </label>
          <p className="font-code-sm text-code-sm text-on-surface-variant mt-1">Images, PDF, ZIP, JSON or text. Max 25 MB each.</p>
        </div>

        <div role="note" className="flex items-start gap-2 p-space-sm bg-surface-container-high border border-on-surface">
          <Icon name="info" className="text-primary text-lg" />
          <p className="font-body-sm text-body-sm text-on-surface">
            <strong>Simulated checkout.</strong> No real money is charged. The amount is held in a demo escrow and
            released to the seller when you approve the delivery.
          </p>
        </div>

        {serverError && (
          <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className="px-space-lg py-2.5 border border-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high">
            Cancel
          </button>
          <button
            type="submit" disabled={isSubmitting || uploading}
            className="px-space-lg py-2.5 bg-primary text-on-primary border border-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Placing order..." : `Place order (${money(pkg.price)})`}
          </button>
        </div>
      </form>
    </Modal>
  );
}