export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  idUsuario: number;
  correo: string;
  rol: string;
  nombre: string;
  apellido: string;
  token: string;
}
