import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function TextActionModal({
  open, onClose, title, description, label, placeholder,
  minLength = 5, maxLength = 500, submitLabel = "Submit", tone = "primary", onSubmit,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValue("");
      setError("");
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    const v = value.trim();
    if (v.length < minLength) return setError(`Please write at least ${minLength} characters`);
    setBusy(true);
    setError("");
    try {
      await onSubmit(v);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const tones = {
    primary: "bg-primary border-primary hover:bg-primary-container",
    danger: "bg-error border-error hover:opacity-90",
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-lg">
      <form onSubmit={submit} className="p-space-lg space-y-space-md">
        {description && <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>}
        <div>
          <label htmlFor="tam-text" className="block font-label-md text-label-md text-on-surface mb-1">{label}</label>
          <textarea
            id="tam-text" rows={4} maxLength={maxLength} value={value} placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-space-md py-2.5 bg-surface-container-lowest border border-outline font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none"
          />
          <div className="flex justify-between">
            <span role="alert" className="font-body-sm text-body-sm text-error">{error}</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">{value.length}/{maxLength}</span>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className="px-space-lg py-2.5 border border-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high">
            Back
          </button>
          <button type="submit" disabled={busy} className={`px-space-lg py-2.5 text-on-primary border font-label-md text-label-md uppercase font-bold disabled:opacity-60 ${tones[tone]}`}>
            {busy ? "Working..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}