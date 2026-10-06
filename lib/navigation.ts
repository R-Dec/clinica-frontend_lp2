import {
  CalendarPlus,
  FileBarChart,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";

export const ROL_ADMIN = "ADMINISTRADOR";
export const ROL_AGENTE = "AGENTE_VENTANILLA";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
  pendiente?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROL_ADMIN, ROL_AGENTE],
  },
  {
    href: "/agendar-cita",
    label: "Agendar Cita",
    icon: CalendarPlus,
    roles: [ROL_ADMIN, ROL_AGENTE],
    pendiente: true,
  },
  {
    href: "/pacientes",
    label: "Pacientes",
    icon: Users,
    roles: [ROL_ADMIN, ROL_AGENTE],
    pendiente: true,
  },
  {
    href: "/medicos",
    label: "Médicos & Especialidades",
    icon: Stethoscope,
    roles: [ROL_ADMIN, ROL_AGENTE],
  },
  {
    href: "/empleados",
    label: "Empleados",
    icon: UserCog,
    roles: [ROL_ADMIN],
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: FileBarChart,
    roles: [ROL_ADMIN],
    pendiente: true,
  },
  {
    href: "/configuracion",
    label: "Configuración",
    icon: Settings,
    roles: [ROL_ADMIN],
    pendiente: true,
  },
];

export function itemsParaRol(rol: string): NavItem[] {
  return NAV_ITEMS.filter((i) => i.roles.includes(rol));
}

export function etiquetaRol(rol: string): string {
  if (rol === ROL_ADMIN) return "Administrador";
  if (rol === ROL_AGENTE) return "Agente de Ventanilla";
  return rol;
}

export function iniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}
