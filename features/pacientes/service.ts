import type { ApiFn } from "@/lib/api";
import type { Paciente, PacienteRequest } from "./types";

export function listarPacientes(api: ApiFn) {
	return api<Paciente[]>("/pacientes");
}

export function buscarPacientePorDni(api: ApiFn, dni: string) {
	return api<Paciente>(`/pacientes/dni/${encodeURIComponent(dni)}`);
}

export function guardarPaciente(
	api: ApiFn,
	id: number | null,
	datos: PacienteRequest,
) {
	return api<Paciente>(id === null ? "/pacientes" : `/pacientes/${id}`, {
		method: id === null ? "POST" : "PUT",
		body: JSON.stringify(datos),
	});
}
