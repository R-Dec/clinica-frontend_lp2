export const ESTADO_PENDIENTE = "PENDIENTE";
export const ESTADO_ATENDIDA = "ATENDIDA";
export const ESTADO_CANCELADA = "CANCELADA";
export const ESTADO_NO_ASISTIO = "NO ASISTIÓ";

export const ESTADOS_CITA = [
	ESTADO_PENDIENTE,
	ESTADO_ATENDIDA,
	ESTADO_CANCELADA,
	ESTADO_NO_ASISTIO,
];

const ETIQUETAS: Record<string, string> = {
	PENDIENTE: "Pendiente",
	ATENDIDA: "Atendida",
	CANCELADA: "Cancelada",
	"NO ASISTIÓ": "No asistió",
};

const ESTILOS: Record<string, string> = {
	PENDIENTE: "bg-amber-50 text-amber-700",
	ATENDIDA: "bg-emerald-50 text-emerald-700",
	CANCELADA: "bg-slate-100 text-slate-500",
	"NO ASISTIÓ": "bg-rose-50 text-rose-700",
};

export function etiquetaEstado(estado: string): string {
	return ETIQUETAS[estado] ?? estado;
}

export function estiloEstado(estado: string): string {
	return ESTILOS[estado] ?? "bg-slate-100 text-slate-500";
}
