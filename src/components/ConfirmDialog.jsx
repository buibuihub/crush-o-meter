import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Keep it',
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[115] grid place-items-center bg-plum/50 p-5 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
      role="presentation"
    >
      <div
        className="modal-card w-full max-w-sm rounded-[1.75rem] bg-paper p-6 shadow-lift"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="confirm-title" className="font-display text-2xl tracking-[-0.03em] text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full p-1.5 text-mauve transition hover:bg-ink/5 hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mauve">{description}</p>
        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink transition hover:bg-ink/[0.03] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-full px-4 py-2.5 text-xs font-semibold text-cream transition disabled:opacity-60 ${
              danger ? 'bg-rose hover:bg-[#c73e56]' : 'bg-plum hover:bg-ink'
            }`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
