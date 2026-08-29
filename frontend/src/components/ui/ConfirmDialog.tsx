import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "./Button";

export function ConfirmDialog({
  cancelLabel = "Keep current state",
  confirmLabel,
  description,
  isBusy = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  isBusy?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    cancelButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isBusy, isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="motion-dialog-overlay fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" role="presentation">
      <section
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="motion-dialog-content app-shadow w-full max-w-md rounded-2xl border border-danger-border bg-surface-elevated p-6"
        role="alertdialog"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
          <button
            aria-label="Close confirmation"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-foreground active:scale-95"
            disabled={isBusy}
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-5 text-xl font-bold text-foreground" id="confirm-dialog-title">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-foreground-muted" id="confirm-dialog-description">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isBusy} onClick={onCancel} ref={cancelButton} variant="secondary">{cancelLabel}</Button>
          <Button isLoading={isBusy} onClick={onConfirm} variant="danger">{confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
