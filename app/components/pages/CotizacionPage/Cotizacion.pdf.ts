import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Vehicle } from "@/app/lib/api/vehicles";
import { NOMBRE_SEVERIDAD } from "./AnalisisFoto/AnalisisFoto.constants";
import type { Estimacion } from "./AnalisisFoto/Estimacion.service";
import { formatearCOP, formatearRango } from "./Cotizacion.utils";

export interface FilaCatalogo {
  nombre: string;
  detalle: string;
  repuesto: number;
  manoObra: number;
  pintura: number;
  cantidad: number;
}

interface PdfParams {
  vehiculo: Vehicle;
  fecha: string;
  filas: FilaCatalogo[];
  estimacion: Estimacion | null;
}

type DocConTabla = jsPDF & { lastAutoTable: { finalY: number } };

export function generarPDF({ vehiculo, fecha, filas, estimacion }: PdfParams) {
  const doc = new jsPDF() as DocConTabla;

  doc.setFontSize(18);
  doc.setTextColor(33, 47, 61);
  doc.text("PRESUPUESTO DE REPARACIÓN", 105, 20, { align: "center" });
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);

  doc.setFontSize(10);
  doc.text(`Vehículo: ${vehiculo.marca} ${vehiculo.modelo}`, 20, 35);
  doc.text(`Placa: ${vehiculo.placa.toUpperCase()}`, 20, 41);
  doc.text(`Fecha: ${fecha}`, 150, 35);

  let siguienteY = 50;

  // 1. Estimado con foto (rango por tipo de taller)
  if (estimacion && estimacion.desglose.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Estimado de reparación (con foto)", 20, siguienteY);

    const cuerpo = estimacion.desglose.map((fila) => [
      fila.pieza,
      NOMBRE_SEVERIDAD[fila.severidad] ?? fila.severidad,
      ...(["economico", "multimarca", "concesionario"] as const).map((tipo) => {
        const rango = fila.precios[tipo];
        return rango ? (formatearRango(rango.minimo_cop, rango.maximo_cop) ?? "-") : "Sin precio";
      }),
    ]);
    const totales = (["economico", "multimarca", "concesionario"] as const).map(
      (tipo) =>
        formatearRango(estimacion.totales[tipo].minimo_cop, estimacion.totales[tipo].maximo_cop) ?? "-",
    );

    autoTable(doc, {
      startY: siguienteY + 4,
      head: [["Pieza", "Severidad", "Económico", "Multimarca", "Concesionario"]],
      body: [...cuerpo, ["TOTAL", "", ...totales]],
      headStyles: { fillColor: [40, 167, 69] },
      styles: { fontSize: 8 },
      didParseCell: (datos) => {
        if (datos.row.index === cuerpo.length) datos.cell.styles.fontStyle = "bold";
      },
    });
    siguienteY = doc.lastAutoTable.finalY + 12;
  }

  // 2. Piezas elegidas con precio de catálogo
  if (filas.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Piezas del catálogo", 20, siguienteY);

    let granTotal = 0;
    const cuerpo = filas.map((fila) => {
      const subtotal = (fila.repuesto + fila.manoObra + fila.pintura) * fila.cantidad;
      granTotal += subtotal;
      return [
        fila.nombre,
        fila.detalle || "Normal",
        formatearCOP(fila.repuesto),
        formatearCOP(fila.manoObra),
        formatearCOP(fila.pintura),
        formatearCOP(subtotal),
      ];
    });

    autoTable(doc, {
      startY: siguienteY + 4,
      head: [["Pieza", "Detalle", "Repuesto", "M. Obra", "Pintura", "Subtotal"]],
      body: cuerpo,
      headStyles: { fillColor: [40, 167, 69] },
      styles: { fontSize: 8 },
      columnStyles: { 5: { halign: "right", fontStyle: "bold" } },
    });
    siguienteY = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL CATÁLOGO (COP):", 110, siguienteY);
    doc.text(formatearCOP(granTotal), 190, siguienteY, { align: "right" });
    siguienteY += 12;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const nota =
    estimacion?.nota ??
    "Este presupuesto es una estimación basada en los precios vigentes de catálogo. Los valores finales pueden variar tras el desarmado del vehículo.";
  doc.text(nota, 20, siguienteY, { maxWidth: 170 });

  doc.save(`Presupuesto_${vehiculo.placa}.pdf`);
}
