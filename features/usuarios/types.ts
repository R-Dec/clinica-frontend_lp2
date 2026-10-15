export interface Usuario {
  idUsuario: number;
  idEmpleado: number;
  nombreEmpleado: string;
  correo: string;
  rol: string;
  estado: boolean;
  creadoEn: string;
}

export interface Rol {
  idRol: number;
  nombreRol: string;
  descripcion: string | null;
}

export interface UsuarioCrear {
  idEmpleado: number;
  idRol: number;
  correo: string;
  password: string;
}

export interface UsuarioActualizar {
  idRol: number;
  correo: string;
}
