import type { ApiFn } from "@/lib/api";
import type {
	Cita,
	CitaRequest,
	Disponibilidad,
	ReprogramarRequest,
} from "./types";

export function listarCitas(api: ApiFn) {
	return api<Cita[]>("/citas");
}

export function consultarDisponibilidad(
	api: ApiFn,
	idEspecialidad: number,
	fecha: string,
) {
	return api<Disponibilidad[]>(
		`/citas/disponibilidad?idEspecialidad=${idEspecialidad}&fecha=${fecha}`,
	);
}

export function registrarCita(api: ApiFn, datos: CitaRequest) {
	return api<Cita>("/citas", { method: "POST", body: JSON.stringify(datos) });
}

export function reprogramarCita(
	api: ApiFn,
	idCita: number,
	datos: ReprogramarRequest,
) {
	return api<Cita>(`/citas/${idCita}/reprogramar`, {
		method: "PUT",
		body: JSON.stringify(datos),
	});
}

export function cambiarEstadoCita(api: ApiFn, idCita: number, estado: string) {
	return api<Cita>(
		`/citas/${idCita}/estado?nombreEstado=${encodeURIComponent(estado)}`,
		{ method: "PATCH" },
	);
}
