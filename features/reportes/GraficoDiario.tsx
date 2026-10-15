import type { PorDia } from "./types";
import { formatoFecha } from "@/lib/fechas";

export default function GraficoDiario({ dias }: { dias: PorDia[] }) {
  const ancho = 600;
  const alto = 170;
  const izq = 32;
  const der = 10;
  const arriba = 10;
  const abajo = 24;
  const max = Math.max(1, ...dias.map((d) => d.total));

  const x = (i: number) =>
    izq +
    (dias.length <= 1
      ? (ancho - izq - der) / 2
      : (i * (ancho - izq - der)) / (dias.length - 1));
  const y = (v: number) => arriba + (alto - arriba - abajo) * (1 - v / max);

  const linea = dias.map((d, i) => `${x(i)},${y(d.total)}`).join(" ");
  const area = `${x(0)},${y(0)} ${linea} ${x(dias.length - 1)},${y(0)}`;

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label="Gráfico de citas por día"
      className="w-full"
    >
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line
            x1={izq}
            x2={ancho - der}
            y1={y(max * f)}
            y2={y(max * f)}
            className="stroke-slate-200"
          />
          <text
            x={izq - 6}
            y={y(max * f) + 3}
            textAnchor="end"
            className="fill-slate-400 text-[10px]"
          >
            {Math.round(max * f)}
          </text>
        </g>
      ))}
      {dias.length > 1 && <polygon points={area} className="fill-sky-100" />}
      <polyline
        points={linea}
        fill="none"
        className="stroke-sky-700"
        strokeWidth={2}
      />
      {dias.length <= 31 &&
        dias.map((d, i) => (
          <circle
            key={d.fecha}
            cx={x(i)}
            cy={y(d.total)}
            r={3}
            className="fill-sky-700"
          >
            <title>{`${formatoFecha(d.fecha)}: ${d.total} citas`}</title>
          </circle>
        ))}
      <text x={izq} y={alto - 6} className="fill-slate-400 text-[10px]">
        {formatoFecha(dias[0].fecha)}
      </text>
      <text
        x={ancho - der}
        y={alto - 6}
        textAnchor="end"
        className="fill-slate-400 text-[10px]"
      >
        {formatoFecha(dias[dias.length - 1].fecha)}
      </text>
    </svg>
  );
}
