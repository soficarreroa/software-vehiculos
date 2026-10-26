import { ETIQUETAS_DANO } from "./ResultadoCotizacion.constants";

const formateadorCop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatCop = (valor: number): string => formateadorCop.format(valor);

export function formatRango(minimo: number | null, maximo: number | null): string {
  if (minimo === null || maximo === null) return "Sin precio";
  return minimo === maximo ? formatCop(minimo) : `${formatCop(minimo)} – ${formatCop(maximo)}`;
}

export const formatPorcentaje = (valor: number): string => `${Math.round(valor * 100)}%`;

export function etiquetaDano(tipo: string | null): string {
  if (!tipo) return "Daño";
  return ETIQUETAS_DANO[tipo] ?? tipo.replace(/_/g, " ");
}

/** Etiquetas de daño que ya usa el presupuesto manual (valor guardado en la base de datos). */
export function etiquetaPresupuesto(tipoDano: string): string | null {
  switch (tipoDano) {
    case "rayon":
      return "Rayon";
    case "abolladura":
      return "Abolladura";
    case "grieta":
    case "vidrio_roto":
    case "luz_rota":
      return "Rotura";
    default:
      return null;
  }
}

/** Minúsculas y sin tildes, para comparar nombres de piezas. */
export function normalizarNombre(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
