import { etiquetaEstado } from "@/features/citas/constantes";
import { infoTurno } from "@/features/empleados/constantes";
import {
	formatoFecha,
	formatoFechaHora,
	formatoMarcaTiempo,
} from "@/lib/fechas";
import {
	ESTADOS_REPORTE,
	formatoPorcentaje,
	porcentaje,
	rellenarDias,
	textoVariacion,
} from "./calculos";
import { nombreArchivo } from "./descarga";
import type { DatosReporte } from "./types";

type RGB = [number, number, number];
type Estilos = Record<number, { halign: "left" | "center" | "right" }>;

const AZUL: RGB = [3, 105, 161];
const GRIS: RGB = [100, 116, 139];
const TINTA: RGB = [15, 23, 42];
const BLANCO: RGB = [255, 255, 255];

function rgb(hex: string): RGB {
	const n = Number.parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export async function exportarPdf(d: DatosReporte): Promise<void> {
	const { jsPDF } = await import("jspdf");
	const autoTable = (await import("jspdf-autotable")).default;

	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const W = doc.internal.pageSize.getWidth();
	const H = doc.internal.pageSize.getHeight();
	const M = 40;
	const ancho = W - M * 2;
	let y = 0;

	const t = d.resumen.totales;
	const f = d.filtros;

	const escribir = (
		s: string,
		x: number,
		yy: number,
		o: {
			size?: number;
			bold?: boolean;
			color?: RGB;
			align?: "left" | "right" | "center";
		} = {},
	) => {
		doc.setFont("helvetica", o.bold ? "bold" : "normal");
		doc.setFontSize(o.size ?? 9);
		doc.setTextColor(...(o.color ?? TINTA));
		doc.text(s, x, yy, { align: o.align ?? "left" });
	};

	const asegurar = (alto: number) => {
		if (y + alto > H - 50) {
			doc.addPage();
			y = 50;
		}
	};

	const titulo = (s: string) => {
		asegurar(40);
		escribir(s, M, y, { size: 11, bold: true, color: AZUL });
		y += 16;
	};

	const tabla = (
		head: string[],
		body: (string | number)[][],
		estilos: Estilos = {},
		fuente = 8,
	) => {
		asegurar(60);
		let fin = y;
		autoTable(doc, {
			startY: y,
			head: [head],
			body: body.map((fila) => fila.map(String)),
			margin: { left: M, right: M, bottom: 50 },
			styles: { fontSize: fuente, cellPadding: 4, textColor: TINTA },
			headStyles: { fillColor: AZUL, textColor: BLANCO },
			alternateRowStyles: { fillColor: [248, 250, 252] },
			columnStyles: estilos,
			didDrawPage: (h) => {
				fin = h.cursor?.y ?? fin;
			},
		});
		y = fin + 22;
	};

	doc.setFillColor(...AZUL);
	doc.rect(0, 0, W, 64, "F");
	escribir("Clínica Salud & Vida", M, 30, {
		size: 16,
		bold: true,
		color: BLANCO,
	});
	escribir("Reporte de citas médicas", M, 47, {
		size: 10,
		color: [224, 242, 254],
	});
	escribir(`Generado el ${formatoMarcaTiempo(d.generadoEn)}`, W - M, 30, {
		size: 8,
		color: BLANCO,
		align: "right",
	});
	escribir(`Por ${d.generadoPor}`, W - M, 44, {
		size: 8,
		color: BLANCO,
		align: "right",
	});

	y = 90;
	escribir(
		`Período: ${formatoFecha(f.desde)} al ${formatoFecha(f.hasta)}`,
		M,
		y,
		{ size: 9, bold: true },
	);
	y += 13;
	escribir(
		`Especialidad: ${d.etiquetaEspecialidad}   ·   Médico: ${d.etiquetaMedico}`,
		M,
		y,
		{
			size: 9,
			color: GRIS,
		},
	);
	y += 24;

	const tarjetas = [
		{
			etiqueta: "Citas registradas",
			valor: String(t.total),
			nota: textoVariacion(t.total, d.anterior.totales.total),
		},
		{
			etiqueta: "Atendidas",
			valor: formatoPorcentaje(porcentaje(t.atendidas, t.total)),
			nota: `${t.atendidas} citas`,
		},
		{
			etiqueta: "Canceladas",
			valor: formatoPorcentaje(porcentaje(t.canceladas, t.total)),
			nota: `${t.canceladas} citas`,
		},
		{
			etiqueta: "Pacientes distintos",
			valor: String(t.pacientesDistintos),
			nota: `${t.medicosConCitas} médicos con citas`,
		},
	];
	const hueco = 10;
	const anchoTarjeta = (ancho - hueco * 3) / 4;
	tarjetas.forEach((c, i) => {
		const x = M + i * (anchoTarjeta + hueco);
		doc.setFillColor(241, 245, 249);
		doc.roundedRect(x, y, anchoTarjeta, 58, 4, 4, "F");
		escribir(c.etiqueta, x + 10, y + 16, { size: 8, color: GRIS });
		escribir(c.valor, x + 10, y + 37, { size: 18, bold: true });
		escribir(c.nota, x + 10, y + 51, { size: 6.5, color: GRIS });
	});
	y += 58 + 24;

	titulo("Estado de las citas");
	const altoBarra = 14;
	if (t.total > 0) {
		let x = M;
		for (const e of ESTADOS_REPORTE) {
			const n = t[e.clave];
			if (!n) continue;
			const w = (ancho * n) / t.total;
			doc.setFillColor(...rgb(e.color));
			doc.rect(x, y, w, altoBarra, "F");
			x += w;
		}
	} else {
		doc.setFillColor(226, 232, 240);
		doc.rect(M, y, ancho, altoBarra, "F");
	}
	y += altoBarra + 14;
	let lx = M;
	for (const e of ESTADOS_REPORTE) {
		const n = t[e.clave];
		const leyenda = `${e.etiqueta}: ${n} (${formatoPorcentaje(porcentaje(n, t.total))})`;
		doc.setFillColor(...rgb(e.color));
		doc.rect(lx, y - 7, 8, 8, "F");
		escribir(leyenda, lx + 12, y, { size: 8, color: GRIS });
		lx += 12 + doc.getTextWidth(leyenda) + 16;
	}
	y += 26;

	const dias = rellenarDias(d.resumen.porDia, f.desde, f.hasta);
	titulo("Evolución diaria de citas");
	const alto = 110;
	asegurar(alto + 30);
	const max = Math.max(1, ...dias.map((p) => p.total));
	const x0 = M + 28;
	const px = (i: number) =>
		dias.length <= 1
			? x0 + (ancho - 28) / 2
			: x0 + (i * (ancho - 28)) / (dias.length - 1);
	const py = (v: number) => y + alto - (v / max) * alto;

	doc.setDrawColor(226, 232, 240);
	doc.setLineWidth(0.5);
	for (const fr of [0, 0.5, 1]) {
		const gy = y + alto - fr * alto;
		doc.line(x0, gy, M + ancho, gy);
		escribir(String(Math.round(max * fr)), x0 - 6, gy + 3, {
			size: 7,
			color: GRIS,
			align: "right",
		});
	}
	doc.setDrawColor(...AZUL);
	doc.setLineWidth(1.5);
	for (let i = 1; i < dias.length; i++) {
		doc.line(px(i - 1), py(dias[i - 1].total), px(i), py(dias[i].total));
	}
	if (dias.length === 1) {
		doc.setFillColor(...AZUL);
		doc.circle(px(0), py(dias[0].total), 3, "F");
	}
	escribir(formatoFecha(dias[0].fecha), x0, y + alto + 12, {
		size: 7,
		color: GRIS,
	});
	escribir(
		formatoFecha(dias[dias.length - 1].fecha),
		M + ancho,
		y + alto + 12,
		{
			size: 7,
			color: GRIS,
			align: "right",
		},
	);
	y += alto + 34;

	titulo("Citas por especialidad");
	const esp = d.resumen.porEspecialidad;
	if (esp.length === 0) {
		escribir("Sin datos en el período.", M, y, { size: 9, color: GRIS });
		y += 20;
	}
	const maxEsp = Math.max(1, ...esp.map((e) => e.total));
	for (const e of esp) {
		asegurar(20);
		escribir(e.especialidad, M, y + 8, { size: 8 });
		const w = Math.max(1, ((ancho - 170) * e.total) / maxEsp);
		doc.setFillColor(...AZUL);
		doc.rect(M + 120, y, w, 10, "F");
		escribir(String(e.total), M + 120 + w + 5, y + 8, { size: 8, bold: true });
		y += 18;
	}
	y += 10;

	titulo("Productividad por médico");
	if (d.resumen.porMedico.length === 0) {
		escribir("Sin datos en el período.", M, y, { size: 9, color: GRIS });
		y += 20;
	} else {
		tabla(
			[
				"Médico",
				"Especialidad",
				"Turno",
				"Total",
				"Atend.",
				"Pend.",
				"Canc.",
				"No asist.",
			],
			[...d.resumen.porMedico]
				.sort((a, b) => b.total - a.total)
				.map((m) => [
					m.medico,
					m.especialidad,
					infoTurno(m.turno)?.etiqueta ?? "—",
					m.total,
					m.atendidas,
					m.pendientes,
					m.canceladas,
					m.noAsistidas,
				]),
			{
				3: { halign: "center" },
				4: { halign: "center" },
				5: { halign: "center" },
				6: { halign: "center" },
				7: { halign: "center" },
			},
		);
	}

	titulo("Citas registradas por usuario de ventanilla");
	if (d.resumen.porUsuario.length === 0) {
		escribir("Sin datos en el período.", M, y, { size: 9, color: GRIS });
		y += 20;
	} else {
		tabla(
			["Usuario", "Citas registradas"],
			d.resumen.porUsuario.map((u) => [u.nombre, u.total]),
			{
				1: { halign: "center" },
			},
		);
	}

	doc.addPage();
	y = 50;
	titulo(`Anexo: detalle de citas (${d.detalle.length})`);
	if (d.detalle.length === 0) {
		escribir("No hay citas en el período seleccionado.", M, y, {
			size: 9,
			color: GRIS,
		});
	} else {
		tabla(
			[
				"Fecha y hora",
				"Paciente",
				"DNI",
				"Médico",
				"Especialidad",
				"Estado",
				"Registró",
			],
			d.detalle.map((c) => [
				formatoFechaHora(c.fechaHoraCita),
				c.paciente,
				c.dniPaciente,
				c.medico,
				c.especialidad,
				etiquetaEstado(c.estado),
				c.registradoPor,
			]),
			{},
			7.5,
		);
	}

	const paginas = doc.getNumberOfPages();
	for (let i = 1; i <= paginas; i++) {
		doc.setPage(i);
		doc.setDrawColor(226, 232, 240);
		doc.setLineWidth(0.5);
		doc.line(M, H - 36, W - M, H - 36);
		escribir("Clínica Salud & Vida · Reporte de citas médicas", M, H - 24, {
			size: 7,
			color: GRIS,
		});
		escribir(`Página ${i} de ${paginas}`, W - M, H - 24, {
			size: 7,
			color: GRIS,
			align: "right",
		});
	}

	doc.save(nombreArchivo(f.desde, f.hasta, "pdf"));
}
