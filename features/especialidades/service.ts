import type { ApiFn } from "@/lib/api";
import type { Especialidad, EspecialidadForm } from "./types";

export function listarEspecialidades(api: ApiFn, soloActivas: boolean) {
	return api<Especialidad[]>(
		soloActivas ? "/especialidades/activas" : "/especialidades",
	);
}

export function guardarEspecialidad(
	api: ApiFn,
	id: number | null,
	datos: EspecialidadForm,
) {
	return api<Especialidad>(
		id === null ? "/especialidades" : `/especialidades/${id}`,
		{
			method: id === null ? "POST" : "PUT",
			body: JSON.stringify(datos),
		},
	);
}

export function alternarEstadoEspecialidad(api: ApiFn, id: number) {
	return api<Especialidad>(`/especialidades/${id}/estado`, { method: "PATCH" });
}
