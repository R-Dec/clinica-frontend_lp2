"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import MedicosPanel from "@/features/empleados/MedicosPanel";
import EspecialidadesPanel from "@/features/especialidades/EspecialidadesPanel";
import { ROL_ADMIN } from "@/lib/navigation";

const PESTANAS = [
	{ id: "medicos", etiqueta: "Médicos" },
	{ id: "especialidades", etiqueta: "Especialidades" },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

export default function MedicosPage() {
	const { user } = useAuth();
	const [pestana, setPestana] = useState<Pestana>("medicos");

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				{PESTANAS.map((p) => (
					<button
						key={p.id}
						type="button"
						aria-pressed={pestana === p.id}
						onClick={() => setPestana(p.id)}
						className={`rounded-lg px-4 py-2 text-sm font-medium ${
							pestana === p.id
								? "bg-sky-700 text-white"
								: "bg-white text-slate-600 hover:bg-slate-100"
						}`}
					>
						{p.etiqueta}
					</button>
				))}
			</div>

			{pestana === "medicos" ? (
				<MedicosPanel />
			) : (
				<EspecialidadesPanel esAdmin={user?.rol === ROL_ADMIN} />
			)}
		</div>
	);
}
