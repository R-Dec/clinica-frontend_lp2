import { Construction } from "lucide-react";

interface Props {
	titulo: string;
	descripcion: string;
}

export default function PaginaPendiente({ titulo, descripcion }: Props) {
	return (
		<div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
			<Construction className="mx-auto mb-3 text-slate-400" size={36} />
			<h2 className="text-lg font-semibold">{titulo}</h2>
			<p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
				{descripcion}
			</p>
		</div>
	);
}
