import type { PiezaCatalogo } from "@/app/types/cotizacionResultado";
import { ETIQUETAS_DANO, PIEZAS_ESTIMABLES } from "./ResultadoCotizacion.constants";

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

/**
 * Categoría con rango de precios del estimador a la que equivale una pieza
 * ("Puerta delantera izquierda" -> "Puerta"). null si no hay equivalencia clara.
 */
export function categoriaEstimador(nombre: string): (typeof PIEZAS_ESTIMABLES)[number] | null {
  const n = normalizarNombre(nombre);
  const exacta = PIEZAS_ESTIMABLES.find((p) => normalizarNombre(p) === n);
  if (exacta) return exacta;
  if (/(baul|maletero|cajuela|portón|porton)/.test(n)) return null;
  if (n.includes("capo")) return "Capó";
  if (/(guardabarro|salpicadera|aleta)/.test(n)) return "Guardabarros";
  if (n.includes("puerta")) return "Puerta";
  if (/(bumper|parachoque|defensa|paragolpe)/.test(n)) {
    if (/(trasero|posterior)/.test(n)) return "Bumper trasero";
    if (/(delantero|frontal)/.test(n)) return "Bumper delantero";
  }
  return null;
}

/** Busca una pieza en el catálogo del vehículo: nombre igual o única coincidencia parcial. */
export function buscarPiezaCatalogo<T extends { nombre: string }>(nombre: string, catalogo: T[]): T | undefined {
  const buscado = normalizarNombre(nombre);
  const exacta = catalogo.find((p) => normalizarNombre(p.nombre) === buscado);
  if (exacta) return exacta;
  const parciales = catalogo.filter((p) => normalizarNombre(p.nombre).includes(buscado));
  return parciales.length === 1 ? parciales[0] : undefined;
}

/** Precio de catálogo completo de una pieza (repuesto + mano de obra + pintura). */
export const precioCatalogo = (p: PiezaCatalogo): number =>
  (p.precio_repuesto ?? 0) + (p.precio_mano_obra ?? 0) + (p.precio_pintura ?? 0);

/** Tipos de daño que ya dicen cuál es la pieza (un vidrio roto es el vidrio, no un panel de carrocería). */
const PIEZA_IMPLICITA: Record<string, RegExp> = {
  vidrio_roto: /(vidrio|parabrisas|cristal|luna|ventanilla|medall?on|luneta)/,
  luz_rota: /(faro|farola|farol|luz|stop|exploradora|direccional)/,
  llanta_baja: /(llanta|neumatico|rin|rueda)/,
};

/**
 * Piezas del catálogo que corresponden a un tipo de daño que ya identifica la pieza.
 * null si el tipo no la identifica (rayón, abolladura, grieta...): ahí el usuario debe elegirla.
 */
export function piezasDelTipoDano<T extends { nombre: string }>(tipo: string | null, catalogo: T[]): T[] | null {
  const patron = tipo ? PIEZA_IMPLICITA[tipo] : undefined;
  if (!patron) return null;
  return catalogo.filter((p) => patron.test(normalizarNombre(p.nombre)));
}
