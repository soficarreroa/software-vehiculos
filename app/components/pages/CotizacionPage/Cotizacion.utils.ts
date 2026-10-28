import {
  ESTABLECIMIENTOS,
  NOMBRE_SEVERIDAD,
  NOMBRE_TIPO_DANO,
  PIEZA_PROPIA,
  type Establecimiento,
} from "./AnalisisFoto/AnalisisFoto.constants";
import type { DanoDetectado } from "./AnalisisFoto/AnalisisFoto.service";
import type { Estimacion } from "./AnalisisFoto/Estimacion.service";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatearCOP(valor: number): string {
  return formatoCOP.format(valor).replace(/\u00a0/g, " ");
}

export function formatearRango(minimo: number | null, maximo: number | null): string | null {
  if (minimo === null || maximo === null) return null;
  if (minimo === maximo) return formatearCOP(minimo);
  return `${formatearCOP(minimo)} - ${formatearCOP(maximo)}`;
}

/** Valor medio del rango del establecimiento elegido (lo que se guarda como monto de la cotización). */
export function montoMedio(estimacion: Estimacion | null, establecimiento: Establecimiento): number | null {
  const total = estimacion?.totales[establecimiento];
  if (!total || total.minimo_cop === null || total.maximo_cop === null) return null;
  return Math.round((total.minimo_cop + total.maximo_cop) / 2);
}

export function nombreEstablecimiento(establecimiento: Establecimiento): string {
  return ESTABLECIMIENTOS.find((e) => e.valor === establecimiento)?.nombre ?? establecimiento;
}

/** Notas del usuario + resumen de lo detectado y del estimado, para guardarlo en la cotización. */
export function construirObservaciones(params: {
  notas: string;
  danos: DanoDetectado[];
  asignaciones: Record<number, string>;
  estimacion: Estimacion | null;
  establecimiento: Establecimiento;
}): string {
  const { notas, danos, asignaciones, estimacion, establecimiento } = params;
  const partes: string[] = [];
  if (notas.trim()) partes.push(notas.trim());

  if (danos.length > 0) {
    const detalle = danos.map((dano, indice) => {
      const nombre = NOMBRE_TIPO_DANO[dano.tipo_dano] ?? dano.tipo_dano;
      const severidad = dano.severidad ? NOMBRE_SEVERIDAD[dano.severidad] ?? dano.severidad : null;
      const pieza = asignaciones[indice] || PIEZA_PROPIA[dano.tipo_dano];
      return `${nombre}${severidad ? ` (${severidad.toLowerCase()})` : ""}${pieza ? ` en ${pieza}` : ""}`;
    });
    partes.push(`Daños detectados en la foto: ${detalle.join(", ")}.`);
  }

  const total = estimacion?.totales[establecimiento];
  const rango = total ? formatearRango(total.minimo_cop, total.maximo_cop) : null;
  if (rango) {
    partes.push(`Estimado ${nombreEstablecimiento(establecimiento).toLowerCase()}: ${rango} COP.`);
  }

  return partes.join("\n");
}
