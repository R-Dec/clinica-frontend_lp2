import type { Row, Workbook } from "exceljs";
import { etiquetaEstado } from "@/features/citas/constantes";
import { infoTurno } from "@/features/empleados/constantes";
import {
  formatoFecha,
  formatoFechaHora,
  formatoMarcaTiempo,
} from "@/lib/fechas";
import {
  formatoPorcentaje,
  porcentaje,
  rellenarDias,
  textoVariacion,
} from "./calculos";
import { descargarArchivo, nombreArchivo } from "./descarga";
import type { DatosReporte } from "./types";

const AZUL = "FF0369A1";

interface Columna<T> {
  titulo: string;
  ancho: number;
  valor: (fila: T) => string | number;
}

function estiloCabecera(fila: Row) {
  fila.font = { bold: true, color: { argb: "FFFFFFFF" } };
  fila.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL } };
  fila.alignment = { vertical: "middle" };
  fila.height = 22;
}

function agregarHoja<T>(
  wb: Workbook,
  nombre: string,
  columnas: Columna<T>[],
  filas: T[],
) {
  const hoja = wb.addWorksheet(nombre, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  hoja.columns = columnas.map((c) => ({ header: c.titulo, width: c.ancho }));
  for (const fila of filas) hoja.addRow(columnas.map((c) => c.valor(fila)));
  estiloCabecera(hoja.getRow(1));
  if (filas.length > 0) {
    hoja.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columnas.length },
    };
  }
}

export async function exportarExcel(d: DatosReporte): Promise<void> {
  const modulo = await import("exceljs");
  const ExcelJS =
    (modulo as unknown as { default?: typeof modulo }).default ?? modulo;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Clínica Salud & Vida";
  wb.created = d.generadoEn;

  const t = d.resumen.totales;
  const f = d.filtros;

  // --- Hoja Resumen ---
  const resumen = wb.addWorksheet("Resumen");
  resumen.columns = [{ width: 34 }, { width: 38 }];
  resumen.mergeCells("A1:B1");
  const titulo = resumen.getCell("A1");
  titulo.value = "Clínica Salud & Vida · Reporte de citas médicas";
  titulo.font = { bold: true, size: 14, color: { argb: AZUL } };
  resumen.addRow([]);
  resumen.addRow([
    "Período",
    `${formatoFecha(f.desde)} al ${formatoFecha(f.hasta)}`,
  ]);
  resumen.addRow(["Especialidad", d.etiquetaEspecialidad]);
  resumen.addRow(["Médico", d.etiquetaMedico]);
  resumen.addRow([
    "Generado",
    `${formatoMarcaTiempo(d.generadoEn)} por ${d.generadoPor}`,
  ]);
  resumen.addRow([]);
  estiloCabecera(resumen.addRow(["Indicador", "Valor"]));
  const indicadores: [string, string | number][] = [
    ["Citas registradas", t.total],
    [
      "Variación vs. período anterior",
      textoVariacion(t.total, d.anterior.totales.total),
    ],
    ["Atendidas", t.atendidas],
    ["Pendientes", t.pendientes],
    ["Canceladas", t.canceladas],
    ["No asistió", t.noAsistidas],
    ["% atendidas", formatoPorcentaje(porcentaje(t.atendidas, t.total))],
    ["% canceladas", formatoPorcentaje(porcentaje(t.canceladas, t.total))],
    ["% no asistió", formatoPorcentaje(porcentaje(t.noAsistidas, t.total))],
    ["Pacientes distintos", t.pacientesDistintos],
    ["Médicos con citas", t.medicosConCitas],
  ];
  for (const [etiqueta, valor] of indicadores)
    resumen.addRow([etiqueta, valor]);

  // --- Hojas de detalle ---
  const estados = <
    T extends {
      total: number;
      pendientes: number;
      atendidas: number;
      canceladas: number;
      noAsistidas: number;
    },
  >() =>
    [
      { titulo: "Total", ancho: 10, valor: (x: T) => x.total },
      { titulo: "Atendidas", ancho: 12, valor: (x: T) => x.atendidas },
      { titulo: "Pendientes", ancho: 12, valor: (x: T) => x.pendientes },
      { titulo: "Canceladas", ancho: 12, valor: (x: T) => x.canceladas },
      { titulo: "No asistió", ancho: 12, valor: (x: T) => x.noAsistidas },
    ] as Columna<T>[];

  type Esp = DatosReporte["resumen"]["porEspecialidad"][number];
  agregarHoja<Esp>(
    wb,
    "Especialidades",
    [
      { titulo: "Especialidad", ancho: 28, valor: (x) => x.especialidad },
      ...estados<Esp>(),
    ],
    d.resumen.porEspecialidad,
  );

  type Med = DatosReporte["resumen"]["porMedico"][number];
  agregarHoja<Med>(
    wb,
    "Médicos",
    [
      { titulo: "Médico", ancho: 28, valor: (x) => x.medico },
      { titulo: "Especialidad", ancho: 22, valor: (x) => x.especialidad },
      {
        titulo: "Turno",
        ancho: 12,
        valor: (x) => infoTurno(x.turno)?.etiqueta ?? "—",
      },
      ...estados<Med>(),
    ],
    [...d.resumen.porMedico].sort((a, b) => b.total - a.total),
  );

  type Dia = DatosReporte["resumen"]["porDia"][number];
  agregarHoja<Dia>(
    wb,
    "Por día",
    [
      { titulo: "Fecha", ancho: 14, valor: (x) => formatoFecha(x.fecha) },
      ...estados<Dia>(),
    ],
    rellenarDias(d.resumen.porDia, f.desde, f.hasta),
  );

  type Usr = DatosReporte["resumen"]["porUsuario"][number];
  agregarHoja<Usr>(
    wb,
    "Ventanilla",
    [
      { titulo: "Usuario", ancho: 30, valor: (x) => x.nombre },
      { titulo: "Citas registradas", ancho: 18, valor: (x) => x.total },
    ],
    d.resumen.porUsuario,
  );

  type Det = DatosReporte["detalle"][number];
  agregarHoja<Det>(
    wb,
    "Detalle",
    [
      {
        titulo: "Fecha y hora",
        ancho: 18,
        valor: (x) => formatoFechaHora(x.fechaHoraCita),
      },
      { titulo: "Paciente", ancho: 28, valor: (x) => x.paciente },
      { titulo: "DNI", ancho: 12, valor: (x) => x.dniPaciente },
      { titulo: "Médico", ancho: 26, valor: (x) => x.medico },
      { titulo: "Especialidad", ancho: 22, valor: (x) => x.especialidad },
      { titulo: "Estado", ancho: 14, valor: (x) => etiquetaEstado(x.estado) },
      { titulo: "Registrado por", ancho: 26, valor: (x) => x.registradoPor },
      {
        titulo: "Fecha de registro",
        ancho: 18,
        valor: (x) => formatoFechaHora(x.fechaRegistro),
      },
    ],
    d.detalle,
  );

  const buffer = await wb.xlsx.writeBuffer();
  descargarArchivo(
    new Blob([buffer as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    nombreArchivo(f.desde, f.hasta, "xlsx"),
  );
}
