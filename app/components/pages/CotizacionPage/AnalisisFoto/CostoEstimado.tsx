"use client";

import Info from "@/app/components/ui/Info/Info";
import { ESTABLECIMIENTOS, NOMBRE_SEVERIDAD, type Establecimiento } from "./AnalisisFoto.constants";
import type { Estimacion } from "./Estimacion.service";
import { formatearRango } from "../Cotizacion.utils";
import styles from "./AnalisisFoto.module.css";

interface CostoEstimadoProps {
  establecimiento: Establecimiento;
  onCambiar: (valor: Establecimiento) => void;
  estimacion: Estimacion | null;
  estimando: boolean;
  error: string | null;
  /** Texto guía cuando todavía no se puede calcular. */
  guia: string | null;
}

export default function CostoEstimado({
  establecimiento,
  onCambiar,
  estimacion,
  estimando,
  error,
  guia,
}: CostoEstimadoProps) {
  const activo = ESTABLECIMIENTOS.find((e) => e.valor === establecimiento) ?? ESTABLECIMIENTOS[1];
  const total = estimacion?.totales[establecimiento];
  const rango = total ? formatearRango(total.minimo_cop, total.maximo_cop) : null;

  return (
    <section className={styles.costo} aria-label="Costo estimado de reparación">
      <h2 className={styles.panelTitulo}>Costo estimado de reparación</h2>

      <div className={styles.pestanas} role="tablist">
        {ESTABLECIMIENTOS.map((e) => (
          <button
            key={e.valor}
            type="button"
            role="tab"
            aria-selected={e.valor === establecimiento}
            className={`${styles.pestana} ${e.valor === establecimiento ? styles.pestanaActiva : ""}`}
            onClick={() => onCambiar(e.valor)}
          >
            {e.nombre}
          </button>
        ))}
      </div>
      <p className={styles.panelAyuda}>{activo.descripcion}</p>

      {guia && <div className={styles.guia}>{guia}</div>}
      {estimando && <div className={styles.guia}>Calculando el costo...</div>}
      {error && <Info severity="error">{error}</Info>}

      {estimacion && !estimando && (
        <>
          <div className={styles.total}>
            {rango ? (
              <>
                <span className={styles.totalValor}>{rango}</span>
                <span className={styles.totalMoneda}>{estimacion.moneda}</span>
              </>
            ) : (
              <span className={styles.totalVacio}>
                No hay precios para este tipo de taller con las piezas elegidas.
              </span>
            )}
          </div>

          {total && !total.completo && rango && (
            <Info severity="warning">
              Estimación parcial: no incluye {total.piezas_no_estimadas.length > 0
                ? total.piezas_no_estimadas.join(", ")
                : "algunos daños"}
              .
            </Info>
          )}

          {estimacion.desglose.length > 0 && (
            <ul className={styles.desglose}>
              {estimacion.desglose.map((fila) => {
                const rangoPieza = fila.precios[establecimiento];
                return (
                  <li key={fila.pieza} className={styles.desgloseFila}>
                    <span>
                      {fila.pieza}{" "}
                      <small>({NOMBRE_SEVERIDAD[fila.severidad] ?? fila.severidad})</small>
                    </span>
                    <strong>
                      {rangoPieza
                        ? formatearRango(rangoPieza.minimo_cop, rangoPieza.maximo_cop)
                        : "Sin precio"}
                    </strong>
                  </li>
                );
              })}
            </ul>
          )}

          {estimacion.danos_no_estimados.length > 0 && (
            <p className={styles.nota}>
              Sin estimar: {[...new Set(estimacion.danos_no_estimados.map((d) => d.motivo))].join(" ")}
            </p>
          )}
          <p className={styles.nota}>{estimacion.nota}</p>
        </>
      )}
    </section>
  );
}
