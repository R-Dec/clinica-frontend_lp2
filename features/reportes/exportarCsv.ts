import { etiquetaEstado } from "@/features/citas/constantes";
import { formatoFechaHora } from "@/lib/fechas";
import { descargarArchivo, nombreArchivo } from "./descarga";
import type { DatosReporte } from "./types";

function celda(valor: string | number): string {
	const texto = String(valor ?? "");
	return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function exportarCsv(d: DatosReporte): void {
	const cabecera = [
		"Fecha y hora",
		"Paciente",
		"DNI",
		"Médico",
		"Especialidad",
		"Estado",
		"Registrado por",
		"Fecha de registro",
	];
	const filas = d.detalle.map((c) => [
		formatoFechaHora(c.fechaHoraCita),
		c.paciente,
		c.dniPaciente,
		c.medico,
		c.especialidad,
		etiquetaEstado(c.estado),
		c.registradoPor,
		formatoFechaHora(c.fechaRegistro),
	]);
	const contenido =
		"\uFEFF" +
		[cabecera, ...filas].map((f) => f.map(celda).join(",")).join("\r\n");

	descargarArchivo(
		new Blob([contenido], { type: "text/csv;charset=utf-8" }),
		nombreArchivo(d.filtros.desde, d.filtros.hasta, "csv"),
	);
}
