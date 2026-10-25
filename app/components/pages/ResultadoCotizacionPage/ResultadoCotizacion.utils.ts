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
