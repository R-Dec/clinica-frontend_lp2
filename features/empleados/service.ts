import type { ApiFn } from "@/lib/api";
import type { Cargo, Empleado, EmpleadoRequest } from "./types";

export function listarEmpleados(api: ApiFn) {
	return api<Empleado[]>("/empleados");
}

export function listarMedicos(
	api: ApiFn,
	idEspecialidad: number | null = null,
) {
	const consulta =
		idEspecialidad === null ? "" : `?idEspecialidad=${idEspecialidad}`;
	return api<Empleado[]>(`/empleados/medicos${consulta}`);
}

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

export function listarCargos(api: ApiFn) {
	return api<Cargo[]>("/cargos");
}
