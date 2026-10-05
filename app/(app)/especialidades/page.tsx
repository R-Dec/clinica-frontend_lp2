"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { mensajeDeError } from "../../lib/api";
import { ROL_ADMIN } from "../../lib/navigation";
import { Especialidad } from "../../lib/types";
import { useApi } from "../../lib/useApi";

export default function EspecialidadesPage() {
  const { user } = useAuth();
  const api = useApi();
  const esAdmin = user?.rol === ROL_ADMIN;
  const ruta = esAdmin ? "/especialidades" : "/especialidades/activas";

  const [lista, setLista] = useState<Especialidad[] | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState<Especialidad | "nueva" | null>(null);

  useEffect(() => {
    let cancelado = false;
    api<Especialidad[]>(ruta)
      .then((datos) => {
        if (cancelado) return;
        setLista(datos);
        setError("");
      })
      .catch((e) => {
        if (!cancelado) setError(mensajeDeError(e));
      });
    return () => {
      cancelado = true;
    };
  }, [api, ruta, version]);

  const recargar = () => setVersion((v) => v + 1);

  async function alternarEstado(esp: Especialidad) {
    try {
      await api(`/especialidades/${esp.idEspecialidad}/estado`, {
        method: "PATCH",
      });
      recargar();
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  const cargando = lista === null && !error;
  const columnas = esAdmin ? 4 : 2;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {esAdmin
            ? "Administra las especialidades de la clínica."
            : "Especialidades disponibles para agendar citas."}
        </p>
        {esAdmin && (
          <button
            type="button"
            onClick={() => setModal("nueva")}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
          >
            <Plus size={16} />
            Nueva especialidad
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Especialidad</th>
              <th className="px-4 py-3">Descripción</th>
              {esAdmin && (
                <>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td
                  colSpan={columnas}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {lista?.length === 0 && (
              <tr>
                <td
                  colSpan={columnas}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No hay especialidades registradas.
                </td>
              </tr>
            )}
            {lista?.map((esp) => (
              <tr
                key={esp.idEspecialidad}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{esp.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{esp.descripcion}</td>
                {esAdmin && (
                  <>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          esp.estado
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {esp.estado ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setModal(esp)}
                          className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarEstado(esp)}
                          className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                        >
                          <Power size={14} />
                          {esp.estado ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        La lista de médicos por especialidad se agregará cuando el backend
        publique ese módulo.
      </p>

      {modal && (
        <EspecialidadModal
          inicial={modal === "nueva" ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            recargar();
          }}
        />
      )}
    </div>
  );
}

interface ModalProps {
  inicial: Especialidad | null;
  onClose: () => void;
  onGuardado: () => void;
}

function EspecialidadModal({ inicial, onClose, onGuardado }: ModalProps) {
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
      await api<unknown>(
        inicial
          ? `/especialidades/${inicial.idEspecialidad}`
          : "/especialidades",
        {
          method: inicial ? "PUT" : "POST",
          body: JSON.stringify({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            estado,
          }),
        },
      );
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

        {error && (
          <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

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
