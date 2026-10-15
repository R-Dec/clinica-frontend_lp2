"use client";

import { useCallback, useState } from "react";
import { KeyRound, Pencil, Plus, Power } from "lucide-react";
import Alerta from "@/components/ui/Alerta";
import { useAuth } from "@/features/auth/AuthContext";
import { listarEmpleados } from "@/features/empleados/service";
import { mensajeDeError } from "@/lib/api";
import { formatoFecha } from "@/lib/fechas";
import { etiquetaRol } from "@/lib/navigation";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import PasswordModal from "./PasswordModal";
import { cambiarEstadoUsuario, listarRoles, listarUsuarios } from "./service";
import type { Usuario } from "./types";
import UsuarioModal from "./UsuarioModal";

/** Solo estos cargos pueden tener usuario (regla del backend). */
const CARGOS_CON_USUARIO = ["RECEPCIONISTA", "ADMINISTRATIVO"];

export default function UsuariosAdmin() {
  const { user } = useAuth();
  const api = useApi();
  const [modal, setModal] = useState<Usuario | "nuevo" | null>(null);
  const [clave, setClave] = useState<Usuario | null>(null);
  const [aviso, setAviso] = useState("");

  const cargarUsuarios = useCallback(() => listarUsuarios(api), [api]);
  const cargarRoles = useCallback(() => listarRoles(api), [api]);
  const cargarEmpleados = useCallback(() => listarEmpleados(api), [api]);
  const usuarios = useCarga(cargarUsuarios);
  const roles = useCarga(cargarRoles);
  const empleados = useCarga(cargarEmpleados);

  const listaUsuarios = usuarios.datos;
  const elegibles =
    listaUsuarios && empleados.datos
      ? empleados.datos.filter(
          (e) =>
            e.estado &&
            CARGOS_CON_USUARIO.includes(e.cargo) &&
            !listaUsuarios.some((u) => u.idEmpleado === e.idEmpleado),
        )
      : [];

  const listo = !!listaUsuarios && !!roles.datos && !!empleados.datos;

  async function alternarEstado(u: Usuario) {
    setAviso("");
    try {
      await cambiarEstadoUsuario(api, u.idUsuario, !u.estado);
      await usuarios.recargar();
    } catch (e) {
      usuarios.setError(mensajeDeError(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Solo el personal de recepción y administración puede tener usuario.
        </p>
        <button
          type="button"
          disabled={!listo || elegibles.length === 0}
          title={
            listo && elegibles.length === 0
              ? "Todos los empleados elegibles ya tienen usuario"
              : undefined
          }
          onClick={() => setModal("nuevo")}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <Alerta mensaje={usuarios.error || roles.error || empleados.error} />
      {aviso && (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          {aviso}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.cargando && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {listaUsuarios?.map((u) => {
              const esYo = u.idUsuario === user?.idUsuario;
              return (
                <tr
                  key={u.idUsuario}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {u.nombreEmpleado}
                    {esYo && (
                      <span className="ml-2 text-xs text-slate-400">(tú)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.correo}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {etiquetaRol(u.rol)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.estado
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatoFecha(u.creadoEn)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <button
                        type="button"
                        disabled={!listo}
                        onClick={() => setModal(u)}
                        className="inline-flex items-center gap-1 text-sky-700 hover:underline disabled:opacity-50"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAviso("");
                          setClave(u);
                        }}
                        className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                      >
                        <KeyRound size={14} />
                        Contraseña
                      </button>
                      <button
                        type="button"
                        disabled={esYo}
                        title={
                          esYo
                            ? "No puedes desactivar tu propia cuenta"
                            : undefined
                        }
                        onClick={() => alternarEstado(u)}
                        className="inline-flex items-center gap-1 text-sky-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                      >
                        <Power size={14} />
                        {u.estado ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && roles.datos && (
        <UsuarioModal
          inicial={modal === "nuevo" ? null : modal}
          empleados={elegibles}
          roles={roles.datos}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            usuarios.recargar();
          }}
        />
      )}

      {clave && (
        <PasswordModal
          usuario={clave}
          onClose={() => setClave(null)}
          onGuardado={() => {
            setAviso(`Contraseña de ${clave.correo} actualizada.`);
            setClave(null);
          }}
        />
      )}
    </div>
  );
}
