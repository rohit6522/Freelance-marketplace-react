import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Icon from "../ui/Icon";
import { reviewService } from "../../services/reviewService";

export default function ReviewModal({ open, onClose, orderId, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment("");
      setError("");
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating");
    if (comment.trim().length < 10) return setError("Please write at least 10 characters of feedback");
    setBusy(true);
    setError("");
    try {
      await reviewService.create({ orderId, rating, comment: comment.trim() });
      toast.success("Thanks! Your review has been posted");
      onClose();
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Leave a review" maxWidth="max-w-lg">
      <form onSubmit={submit} className="p-space-lg space-y-space-md">
        <div>
          <span className="block font-label-md text-label-md text-on-surface mb-1">Your rating *</span>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)} className="text-primary"
              >
                <Icon name="star" filled={n <= rating} className={`text-4xl ${n <= rating ? "" : "opacity-30"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="review-comment" className="block font-label-md text-label-md text-on-surface mb-1">Written feedback *</label>
          <textarea
            id="review-comment" rows={4} maxLength={1500} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="How was the communication, quality and delivery?"
            className="w-full px-space-md py-2.5 bg-surface-container-lowest border border-outline font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none"
          />
        </div>
        {error && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{error}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className="px-space-lg py-2.5 border border-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high">Back</button>
          <button type="submit" disabled={busy} className="px-space-lg py-2.5 bg-primary text-on-primary border border-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container disabled:opacity-60">
            {busy ? "Posting..." : "Post review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}