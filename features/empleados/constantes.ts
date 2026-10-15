export const CARGO_MEDICO = "MEDICO";
export const CARGO_RECEPCIONISTA = "RECEPCIONISTA";

/** Horarios definidos por el backend. */
export const TURNOS = [
  { valor: "DIURNO", etiqueta: "Diurno", horario: "06:00 – 18:00" },
  { valor: "NOCTURNO", etiqueta: "Nocturno", horario: "18:00 – 06:00" },
] as const;

export function infoTurno(turno: string | null) {
  return TURNOS.find((t) => t.valor === turno) ?? null;
}

const ETIQUETAS_CARGO: Record<string, string> = {
  MEDICO: "Médico",
  RECEPCIONISTA: "Recepcionista",
  ADMINISTRATIVO: "Administrativo",
};

export function etiquetaCargo(nombreCargo: string): string {
  return ETIQUETAS_CARGO[nombreCargo] ?? nombreCargo;
}
