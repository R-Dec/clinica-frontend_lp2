export interface Paciente {
	idPaciente: number;
	nombre: string;
	apellido: string;
	dni: string;
	telefono: string | null;
	nombreUsuarioRegistro: string | null;
	apellidoUsuarioRegistro: string | null;
	correoUsuarioRegistro: string | null;
}

export interface PacienteRequest {
	nombre: string;
	apellido: string;
	dni: string;
	telefono: string | null;
}
