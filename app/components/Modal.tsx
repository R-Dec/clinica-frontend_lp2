"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ titulo, onClose, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40"
      />
      <dialog
        open
        aria-labelledby="modal-titulo"
        className="relative m-0 w-full max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-titulo" className="text-lg font-bold">
            {titulo}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  );
}
