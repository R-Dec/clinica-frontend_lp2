import { Suspense } from "react";
import AgendarCita from "@/features/citas/AgendarCita";

export default function AgendarCitaPage() {
	return (
		<Suspense fallback={<p className="text-slate-500">Cargando...</p>}>
			<AgendarCita />
		</Suspense>
	);
}
