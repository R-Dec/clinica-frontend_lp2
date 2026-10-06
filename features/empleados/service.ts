import type { ApiFn } from "@/lib/api";
import type { Cargo, Empleado, EmpleadoRequest } from "./types";

/** Solo administrador. */
export function listarEmpleados(api: ApiFn) {
  return api<Empleado[]>("/empleados");
}

/** Médicos activos (administrador y agente). Opcionalmente por especialidad. */
export function listarMedicos(
  api: ApiFn,
  idEspecialidad: number | null = null,
) {
  const consulta =
    idEspecialidad === null ? "" : `?idEspecialidad=${idEspecialidad}`;
  return api<Empleado[]>(`/empleados/medicos${consulta}`);
}

/** id = null crea; con id actualiza. */
export function guardarEmpleado(
  api: ApiFn,
  id: number | null,
  datos: EmpleadoRequest,
) {
  return api<Empleado>(id === null ? "/empleados" : `/empleados/${id}`, {
    method: id === null ? "POST" : "PUT",
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoEmpleado(api: ApiFn, id: number, estado: boolean) {
  return api<Empleado>(`/empleados/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

/** Requiere el endpoint GET /cargos (paso 2). */
export function listarCargos(api: ApiFn) {
  return api<Cargo[]>("/cargos");
}
