export interface Empleado {
	idEmpleado: number;
	idCargo: number;
	cargo: string;
	idEspecialidad: number | null;
	especialidad: string | null;
	nombre: string;
	apellido: string;
	dni: string;
	telefono: string | null;
	turno: string | null;
	estado: boolean;
}

export interface EmpleadoRequest {
	idCargo: number;
	idEspecialidad: number | null;
	nombre: string;
	apellido: string;
	dni: string;
	telefono: string | null;
	turno: string | null;
}

export interface Cargo {
	idCargo: number;
	nombreCargo: string;
	descripcion: string | null;
}
