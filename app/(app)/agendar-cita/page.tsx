import PaginaPendiente from "@/components/ui/PaginaPendiente";

export default function AgendarCitaPage() {
  return (
    <PaginaPendiente
      titulo="Agendar cita"
      descripcion="Flujo previsto: elegir paciente → especialidad → médico → horario disponible (calculado por el backend, citas de 45 min). Se habilita cuando estén listos Pacientes y Citas."
    />
  );
}
