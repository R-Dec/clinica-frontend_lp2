export function aISO(fecha: Date): string {
	const y = fecha.getFullYear();
	const m = String(fecha.getMonth() + 1).padStart(2, "0");
	const d = String(fecha.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function hoyISO(): string {
	return aISO(new Date());
}

function desdeISO(iso: string): Date {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, m - 1, d);
}

export function sumarDias(iso: string, dias: number): string {
	const f = desdeISO(iso);
	f.setDate(f.getDate() + dias);
	return aISO(f);
}

export function diasEntre(desde: string, hasta: string): number {
	const ms = desdeISO(hasta).getTime() - desdeISO(desde).getTime();
	return Math.round(ms / 86_400_000) + 1;
}

export function primerDiaDelMes(): string {
	const f = new Date();
	return aISO(new Date(f.getFullYear(), f.getMonth(), 1));
}

export function formatoFecha(iso: string): string {
	const [y, m, d] = iso.slice(0, 10).split("-");
	return `${d}/${m}/${y}`;
}

export function formatoHora(fechaHora: string): string {
	return fechaHora.slice(11, 16);
}

export function formatoFechaHora(fechaHora: string): string {
	return `${formatoFecha(fechaHora)} ${formatoHora(fechaHora)}`;
}

export function formatoMarcaTiempo(fecha: Date): string {
	const h = String(fecha.getHours()).padStart(2, "0");
	const m = String(fecha.getMinutes()).padStart(2, "0");
	return `${formatoFecha(aISO(fecha))} ${h}:${m}`;
}

export function esFuturo(fechaHora: string): boolean {
	return new Date(fechaHora).getTime() > Date.now();
}
