export interface Cita {
	idCita: number;
	idPaciente: number;
	nombrePaciente: string;
	apellidoPaciente: string;
	dniPaciente: string;
	idMedico: number;
	nombreMedico: string;
	apellidoMedico: string;
	nombreEspecialidad: string;
	fechaHoraCita: string;
	fechaRegistro: string;
	estado: string;
	nombreUsuarioRegistro: string;
	apellidoUsuarioRegistro: string;
	correoUsuarioRegistro: string;
}

export interface MedicoDisponible {
	idMedico: number;
	nombre: string;
	apellido: string;
}

export interface Disponibilidad {
	fechaHora: string;
	medicos: MedicoDisponible[];
}

export interface CitaRequest {
	idPaciente: number;
	idMedico: number;
	fechaHoraCita: string;
}

export interface ReprogramarRequest {
	idMedico: number;
	fechaHoraCita: string;
}
