import PaginaPendiente from "../../components/PaginaPendiente";

export default function AgendarCitaPage() {
  return (
    <PaginaPendiente
      titulo="Agendar cita"
      descripcion="Flujo previsto: elegir paciente → especialidad → médico → horario disponible (calculado por el backend, citas de 45 min). Se habilita cuando estén listos Pacientes, Médicos y Citas."
    />
  );
}
