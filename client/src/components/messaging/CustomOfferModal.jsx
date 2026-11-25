import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import FieldError from "../ui/FieldError";
import { inputCls, labelCls, primaryBtn, ghostBtn } from "../ui/formStyles";
import { conversationService } from "../../services/conversationService";

export default function CustomOfferModal({ open, onClose, conversationId, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      deliveryDays: "3",
      revisions: "1",
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await conversationService.sendCustomOffer(conversationId, {
        title: data.title.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        deliveryDays: Number(data.deliveryDays),
        revisions: Number(data.revisions),
      });
      toast.success("Custom offer sent to client!");
      reset();
      onClose();
      onDone();
    } catch (err) {
      toast.error(err.message || "Failed to send offer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Custom Offer">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-space-lg space-y-space-md">
        <div>
          <label htmlFor="offerTitle" className={labelCls}>Offer Title *</label>
          <input
            id="offerTitle"
            placeholder="e.g. Landing Page Design + Responsive Code"
            className={inputCls(errors.title)}
            {...register("title", {
              required: "Title is required",
              minLength: { value: 3, message: "At least 3 characters" },
              maxLength: { value: 120, message: "Maximum 120 characters" },
            })}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <label htmlFor="offerDescription" className={labelCls}>Scope of Work & Requirements *</label>
          <textarea
            id="offerDescription"
            rows={4}
            placeholder="Describe exactly what deliverables and milestones will be completed in this custom offer..."
            className={inputCls(errors.description)}
            {...register("description", {
              required: "Description is required",
              minLength: { value: 10, message: "At least 10 characters" },
              maxLength: { value: 2000, message: "Maximum 2000 characters" },
            })}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          <div>
            <label htmlFor="offerPrice" className={labelCls}>Price (₹) *</label>
            <input
              id="offerPrice"
              type="number"
              placeholder="e.g. 2500"
              className={inputCls(errors.price)}
              {...register("price", {
                required: "Price is required",
                min: { value: 50, message: "Min ₹50" },
              })}
            />
            <FieldError message={errors.price?.message} />
          </div>

          <div>
            <label htmlFor="offerDays" className={labelCls}>Delivery (Days) *</label>
            <input
              id="offerDays"
              type="number"
              className={inputCls(errors.deliveryDays)}
              {...register("deliveryDays", {
                required: "Days required",
                min: { value: 1, message: "Min 1 day" },
                max: { value: 180, message: "Max 180 days" },
              })}
            />
            <FieldError message={errors.deliveryDays?.message} />
          </div>

          <div>
            <label htmlFor="offerRevisions" className={labelCls}>Revisions</label>
            <input
              id="offerRevisions"
              type="number"
              className={inputCls(errors.revisions)}
              {...register("revisions", {
                min: { value: 0, message: "Min 0" },
              })}
            />
            <FieldError message={errors.revisions?.message} />
          </div>
        </div>

        <div className="flex justify-end gap-space-sm pt-space-sm border-t border-outline-variant">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" disabled={submitting} className={primaryBtn}>
            {submitting ? "Sending Offer..." : "Send Custom Offer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
