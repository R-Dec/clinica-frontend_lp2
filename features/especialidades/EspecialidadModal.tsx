"use client";

import { FormEvent, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import { mensajeDeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { guardarEspecialidad } from "./service";
import type { Especialidad } from "./types";

interface Props {
  inicial: Especialidad | null;
  onClose: () => void;
  onGuardado: () => void;
}

export default function EspecialidadModal({
  inicial,
  onClose,
  onGuardado,
}: Props) {
  const api = useApi();
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [estado, setEstado] = useState(inicial?.estado ?? true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await guardarEspecialidad(api, inicial?.idEspecialidad ?? null, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estado,
      });
      onGuardado();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo={inicial ? "Editar especialidad" : "Nueva especialidad"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="esp-nombre"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Nombre
          </label>
          <input
            id="esp-nombre"
            required
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="esp-desc"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Descripción
          </label>
          <textarea
            id="esp-desc"
            rows={3}
            maxLength={255}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="esp-estado"
            type="checkbox"
            checked={estado}
            onChange={(e) => setEstado(e.target.checked)}
          />
          <label htmlFor="esp-estado" className="text-sm text-slate-700">
            Especialidad activa
          </label>
        </div>

        <Alerta mensaje={error} />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
          >
            {enviando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
