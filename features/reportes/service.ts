import type { ApiFn } from "@/lib/api";
import type { FiltrosReporte, ReporteDetalle, ReporteResumen } from "./types";

function consulta(f: FiltrosReporte): string {
	const p = new URLSearchParams({ desde: f.desde, hasta: f.hasta });
	if (f.idEspecialidad !== null)
		p.set("idEspecialidad", String(f.idEspecialidad));
	if (f.idMedico !== null) p.set("idMedico", String(f.idMedico));
	return p.toString();
}

export function obtenerResumen(api: ApiFn, f: FiltrosReporte) {
	return api<ReporteResumen>(`/reportes/citas/resumen?${consulta(f)}`);
}

export function obtenerDetalle(api: ApiFn, f: FiltrosReporte) {
	return api<ReporteDetalle[]>(`/reportes/citas/detalle?${consulta(f)}`);
}
