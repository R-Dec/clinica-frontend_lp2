export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export interface EspecialidadForm {
  nombre: string;
  descripcion: string;
  estado: boolean;
}
