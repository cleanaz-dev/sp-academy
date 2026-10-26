// components/ui/modal.tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** Set false to block Escape and backdrop click (e.g. while a request is running) */
  dismissible?: boolean;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  labelledBy,
  dismissible = true,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // showModal() puts the dialog in the browser's top layer:
  // no portal, no z-index fights, built-in focus trap, focus returns on close.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      // Escape: let React state decide instead of the browser closing it
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      // Backdrop click lands on the <dialog> itself, not the inner card
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md bg-transparent p-0 text-white backdrop:bg-slate-950/80"
    >
      {open && children}
    </dialog>
  );
}