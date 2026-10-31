import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Icon from "../ui/Icon";
import { orderService } from "../../services/orderService";
import { uploadService } from "../../services/uploadService";
import { formatBytes } from "../../utils/format";

export default function DeliverModal({ open, onClose, order, onDone }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMessage("");
      setFiles([]);
      setError("");
    }
  }, [open]);

  const addFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (files.length >= 10) return toast.error("Maximum 10 files per delivery");
    setUploading(true);
    try {
      setFiles((l) => [...l, await uploadService.file(file)]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 5) return setError("Please describe what you are delivering (5+ characters)");
    setBusy(true);
    setError("");
    try {
      await orderService.deliver(order._id, {
        message: message.trim(),
        files: files.map(({ url, name, size }) => ({ url, name, size })),
      });
      toast.success("Work delivered to the client");
      onClose();
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={order.status === "revision_requested" ? "Submit revised delivery" : "Deliver work"}>
      <form onSubmit={submit} className="p-space-lg space-y-space-md">
        <div>
          <label htmlFor="deliver-msg" className="block font-label-md text-label-md text-on-surface mb-1">Delivery message *</label>
          <textarea
            id="deliver-msg" rows={4} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Summarise what's included and anything the client should check."
            className="w-full px-space-md py-2.5 bg-surface-container-lowest border border-outline font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-label-md text-on-surface">Delivery files</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">{files.length}/10</span>
          </div>
          {files.length > 0 && (
            <ul className="mb-space-xs space-y-1">
              {files.map((f, i) => (
                <li key={f.publicId || f.url} className="flex items-center justify-between bg-surface-container-low px-space-sm py-1 font-code-sm text-code-sm">
                  <span className="truncate">{f.name} <span className="text-on-surface-variant">{formatBytes(f.size)}</span></span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((l) => l.filter((_, idx) => idx !== i))} className="hover:text-error">
                    <Icon name="close" className="text-base" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="inline-flex items-center gap-1.5 px-space-md py-2 border border-on-surface font-label-sm text-label-sm uppercase font-bold cursor-pointer hover:bg-surface-container-high">
            <Icon name={uploading ? "sync" : "upload_file"} className={`text-base ${uploading ? "animate-spin" : ""}`} />
            {uploading ? "Uploading..." : "Add file"}
            <input type="file" className="sr-only" onChange={addFile} disabled={uploading} accept=".jpg,.jpeg,.png,.webp,.pdf,.zip,.json,.txt,.md" />
          </label>
        </div>
        {error && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{error}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
          <button type="button" onClick={onClose} className="px-space-lg py-2.5 border border-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high">Back</button>
          <button type="submit" disabled={busy || uploading} className="px-space-lg py-2.5 bg-primary text-on-primary border border-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container disabled:opacity-60">
            {busy ? "Delivering..." : "Deliver work"}
          </button>
        </div>
      </form>
    </Modal>
  );
}