import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-space-md overflow-y-auto bg-[rgba(15,23,42,0.6)]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`w-full ${maxWidth} my-auto bg-surface-container-lowest border-2 border-on-surface outline-none`}
      >
        <div className="flex items-center justify-between px-space-md py-space-sm border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-on-surface hover:text-error">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}