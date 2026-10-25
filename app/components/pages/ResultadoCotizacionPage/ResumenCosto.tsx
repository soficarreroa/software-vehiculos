"use client";

import Info from "@/app/components/ui/Info/Info";
import type { EstimacionResponse, TipoEstablecimiento } from "@/app/types/cotizacionResultado";
import { ESTABLECIMIENTOS } from "./ResultadoCotizacion.constants";
import { formatRango } from "./ResultadoCotizacion.utils";
import styles from "./ResultadoCotizacion.module.css";

interface ResumenCostoProps {
  estimacion: EstimacionResponse | null;
  establecimiento: TipoEstablecimiento;
  onCambiarEstablecimiento: (valor: TipoEstablecimiento) => void;
  totalDanos: number;
  asignados: number;
}

export default function ResumenCosto({
  estimacion,
  establecimiento,
  onCambiarEstablecimiento,
  totalDanos,
  asignados,
}: ResumenCostoProps) {
  const activo = ESTABLECIMIENTOS.find((e) => e.clave === establecimiento) ?? ESTABLECIMIENTOS[0];
  const total = estimacion?.totales[establecimiento];

  return (
    <section className={styles.resumen} aria-labelledby="titulo-resumen">
      <h2 id="titulo-resumen" className={styles.resumenTitulo}>
        Costo estimado de reparación
      </h2>

      <div className={styles.tabs} role="tablist" aria-label="Tipo de taller">
        {ESTABLECIMIENTOS.map((e) => (
          <button
            key={e.clave}
            type="button"
            role="tab"
            aria-selected={e.clave === establecimiento}
            className={`${styles.tab} ${e.clave === establecimiento ? styles.tabActiva : ""}`}
            onClick={() => onCambiarEstablecimiento(e.clave)}
          >
            {e.etiqueta}
          </button>
        ))}
      </div>
      <p className={styles.tabDescripcion}>{activo.descripcion}</p>

      <div className={styles.total} aria-live="polite">
        {total && total.minimo_cop !== null && total.maximo_cop !== null ? (
          <>
            <span className={styles.totalValor}>{formatRango(total.minimo_cop, total.maximo_cop)}</span>
            <span className={styles.totalMoneda}>{estimacion?.moneda ?? "COP"} · valor aproximado</span>
          </>
        ) : estimacion ? (
          <span className={styles.totalVacio}>No hay precios disponibles para este tipo de taller.</span>
        ) : (
          <span className={styles.totalVacio}>
            {asignados === 0
              ? "Asigna la pieza afectada a cada daño para calcular el costo."
              : `${asignados} de ${totalDanos} daños con pieza asignada. Pulsa «Calcular estimado».`}
          </span>
        )}
      </div>

      {total && !total.completo && (
        <Info severity="warning">
          Estimación incompleta: faltan precios para {total.piezas_no_estimadas.join(", ") || "algunas piezas"}.
          El total no las incluye.
        </Info>
      )}

      {estimacion && estimacion.desglose.length > 0 && (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <caption className={styles.soloLector}>Desglose por pieza</caption>
            <thead>
              <tr>
                <th scope="col">Pieza</th>
                <th scope="col">Severidad</th>
                <th scope="col" className={styles.derecha}>
                  Rango estimado
                </th>
              </tr>
            </thead>
            <tbody>
              {estimacion.desglose.map((fila) => {
                const rango = fila.precios[establecimiento];
                return (
                  <tr key={fila.pieza}>
                    <td data-label="Pieza">{fila.pieza}</td>
                    <td data-label="Severidad" className={styles.capitalizar}>
                      {fila.severidad}
                    </td>
                    <td data-label="Rango estimado" className={styles.derecha}>
                      {rango ? formatRango(rango.minimo_cop, rango.maximo_cop) : "Sin precio"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
