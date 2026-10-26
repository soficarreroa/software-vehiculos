"use client";

import Pill from "@/app/components/ui/Pill/Pill";
import type {
  DanoDetectado,
  EstimacionResponse,
  ExtraCatalogo,
  PiezaCatalogo,
  TipoEstablecimiento,
} from "@/app/types/cotizacionResultado";
import { COLOR_SEVERIDAD, ETIQUETAS_SEVERIDAD, PIEZAS_ESTIMABLES } from "./ResultadoCotizacion.constants";
import { etiquetaDano, formatCop, formatPorcentaje, formatRango, normalizarNombre } from "./ResultadoCotizacion.utils";
import styles from "./ResultadoCotizacion.module.css";

interface ListaDanosProps {
  danos: DanoDetectado[];
  asignaciones: Record<number, string>;
  onAsignar: (indice: number, pieza: string) => void;
  estimacion: EstimacionResponse | null;
  extras: ExtraCatalogo[];
  catalogo: PiezaCatalogo[];
  establecimiento: TipoEstablecimiento;
  resaltado: number | null;
  onResaltar: (indice: number | null) => void;
  deshabilitado: boolean;
}

export default function ListaDanos({
  danos,
  asignaciones,
  onAsignar,
  estimacion,
  extras,
  catalogo,
  establecimiento,
  resaltado,
  onResaltar,
  deshabilitado,
}: ListaDanosProps) {
  // Piezas del vehículo que no son una de las categorías con rango de precios
  const nombresCategoria = new Set(PIEZAS_ESTIMABLES.map(normalizarNombre));
  const piezasVehiculo = catalogo.filter((p) => !nombresCategoria.has(normalizarNombre(p.nombre)));

  /** Qué pasó con cada daño tras calcular: rango de su pieza, ignorado o no estimado. */
  const estadoDano = (indice: number) => {
    const pieza = estimacion?.desglose.find((d) => d.danos.some((x) => x.indice_dano === indice));
    if (pieza) {
      const rango = pieza.precios[establecimiento];
      return {
        tipo: "ok" as const,
        pieza: pieza.pieza,
        texto: rango ? formatRango(rango.minimo_cop, rango.maximo_cop) : "Sin precio en este tipo de taller",
      };
    }
    const extra = extras.find((e) => e.indices.includes(indice));
    if (extra) {
      return {
        tipo: "ok" as const,
        pieza: extra.nombre,
        texto: `${formatCop(extra.valor)} (precio de catálogo)`,
      };
    }
    if (!estimacion) return null;
    const ignorado = estimacion.danos_ignorados.find((d) => d.indice_dano === indice);
    if (ignorado) return { tipo: "aviso" as const, texto: ignorado.motivo };
    const noEstimado = estimacion.danos_no_estimados.find((d) => d.indice_dano === indice);
    if (noEstimado) return { tipo: "aviso" as const, texto: noEstimado.motivo };
    return null;
  };

  return (
    <ol className={styles.lista}>
      {danos.map((dano, i) => {
        const severidad = dano.severidad;
        const estado = estadoDano(i);
        const idSelect = `pieza-dano-${i}`;
        return (
          <li
            key={`${dano.clase_yolo}-${i}`}
            className={`${styles.danoItem} ${resaltado === i ? styles.danoResaltado : ""}`}
            onMouseEnter={() => onResaltar(i)}
            onMouseLeave={() => onResaltar(null)}
          >
            <span className={styles.danoNumero} aria-hidden="true">
              {i + 1}
            </span>
            <div className={styles.danoCuerpo}>
              <div className={styles.danoCabecera}>
                <strong className={styles.danoNombre}>{etiquetaDano(dano.tipo_dano)}</strong>
                {severidad ? (
                  <Pill color={COLOR_SEVERIDAD[severidad]}>{ETIQUETAS_SEVERIDAD[severidad]}</Pill>
                ) : (
                  <Pill color="warning">Severidad sin definir</Pill>
                )}
              </div>

              <div className={styles.confianza}>
                <span className={styles.confianzaTexto}>Confianza {formatPorcentaje(dano.confianza)}</span>
                <div
                  className={styles.barra}
                  role="progressbar"
                  aria-label={`Confianza del daño ${i + 1}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(dano.confianza * 100)}
                >
                  <div className={styles.barraRelleno} style={{ width: formatPorcentaje(dano.confianza) }} />
                </div>
              </div>

              <div className={styles.piezaFila}>
                <label htmlFor={idSelect} className={styles.piezaLabel}>
                  Pieza afectada
                </label>
                <select
                  id={idSelect}
                  className={styles.select}
                  value={asignaciones[i] ?? ""}
                  disabled={deshabilitado}
                  onChange={(e) => onAsignar(i, e.target.value)}
                >
                  <option value="">Selecciona la pieza…</option>
                  <optgroup label="Categorías con rango de precios">
                    {PIEZAS_ESTIMABLES.map((pieza) => (
                      <option key={pieza} value={pieza}>
                        {pieza}
                      </option>
                    ))}
                  </optgroup>
                  {piezasVehiculo.length > 0 && (
                    <optgroup label="Piezas de tu vehículo (precio de catálogo)">
                      {piezasVehiculo.map((pieza) => (
                        <option key={pieza.id} value={pieza.nombre}>
                          {pieza.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {estado && (
                <p className={estado.tipo === "ok" ? styles.estadoOk : styles.estadoAviso}>
                  {estado.tipo === "ok" ? (
                    <>
                      <span className={styles.estadoPieza}>{estado.pieza}:</span> {estado.texto}
                    </>
                  ) : (
                    estado.texto
                  )}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
