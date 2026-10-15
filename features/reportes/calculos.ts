import { diasEntre, sumarDias } from "@/lib/fechas";
import type { PorDia, ReporteEstados } from "./types";

export const ESTADOS_REPORTE: {
  clave: Exclude<keyof ReporteEstados, "total">;
  etiqueta: string;
  color: string;
}[] = [
  { clave: "atendidas", etiqueta: "Atendidas", color: "#2a78d6" },
  { clave: "pendientes", etiqueta: "Pendientes", color: "#eda100" },
  { clave: "canceladas", etiqueta: "Canceladas", color: "#898781" },
  { clave: "noAsistidas", etiqueta: "No asistió", color: "#d6455d" },
];

export function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : (parte / total) * 100;
}

export function formatoPorcentaje(valor: number): string {
  return `${valor.toFixed(1).replace(".", ",")}%`;
}

/** Período inmediatamente anterior y de igual duración. */
export function rangoAnterior(desde: string, hasta: string) {
  const dias = diasEntre(desde, hasta);
  const finAnterior = sumarDias(desde, -1);
  return { desde: sumarDias(finAnterior, -(dias - 1)), hasta: finAnterior };
}

/** Variación porcentual; null si no hay base de comparación. */
export function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((actual - anterior) / anterior) * 100;
}

export function textoVariacion(actual: number, anterior: number): string {
  const v = variacion(actual, anterior);
  if (v === null) return "Sin período anterior para comparar";
  const signo = v >= 0 ? "+" : "";
  return `${signo}${v.toFixed(1).replace(".", ",")}% vs. período anterior`;
}

/** Completa con ceros los días sin citas para que el gráfico sea continuo. */
export function rellenarDias(
  porDia: PorDia[],
  desde: string,
  hasta: string,
): PorDia[] {
  const mapa = new Map(porDia.map((d) => [d.fecha.slice(0, 10), d]));
  const resultado: PorDia[] = [];
  const dias = diasEntre(desde, hasta);
  for (let i = 0; i < dias; i++) {
    const fecha = sumarDias(desde, i);
    resultado.push(
      mapa.get(fecha) ?? {
        fecha,
        total: 0,
        pendientes: 0,
        atendidas: 0,
        canceladas: 0,
        noAsistidas: 0,
      },
    );
  }
  return resultado;
}
