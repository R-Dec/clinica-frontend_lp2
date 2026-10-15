export interface ReporteEstados {
  total: number;
  pendientes: number;
  atendidas: number;
  canceladas: number;
  noAsistidas: number;
}

export interface ReporteTotales extends ReporteEstados {
  pacientesDistintos: number;
  medicosConCitas: number;
}

export interface PorEspecialidad extends ReporteEstados {
  idEspecialidad: number;
  especialidad: string;
}

export interface PorMedico extends ReporteEstados {
  idMedico: number;
  medico: string;
  especialidad: string;
  turno: string | null;
}

export interface PorDia extends ReporteEstados {
  fecha: string;
}

export interface PorUsuario {
  idUsuario: number;
  nombre: string;
  total: number;
}

export interface ReporteResumen {
  desde: string;
  hasta: string;
  totales: ReporteTotales;
  porEspecialidad: PorEspecialidad[];
  porMedico: PorMedico[];
  porDia: PorDia[];
  porUsuario: PorUsuario[];
}

export interface ReporteDetalle {
  idCita: number;
  fechaHoraCita: string;
  paciente: string;
  dniPaciente: string;
  medico: string;
  especialidad: string;
  estado: string;
  registradoPor: string;
  fechaRegistro: string;
}

export interface FiltrosReporte {
  desde: string;
  hasta: string;
  idEspecialidad: number | null;
  idMedico: number | null;
}

/** Todo lo necesario para generar PDF, Excel o CSV. */
export interface DatosReporte {
  filtros: FiltrosReporte;
  etiquetaEspecialidad: string;
  etiquetaMedico: string;
  generadoPor: string;
  generadoEn: Date;
  resumen: ReporteResumen;
  anterior: ReporteResumen;
  detalle: ReporteDetalle[];
}
