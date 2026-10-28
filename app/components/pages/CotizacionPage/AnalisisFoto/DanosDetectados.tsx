"use client";

import Pill from "@/app/components/ui/Pill/Pill";
import {
  COLOR_SEVERIDAD,
  NOMBRE_SEVERIDAD,
  NOMBRE_TIPO_DANO,
  PIEZA_PROPIA,
  PIEZAS_ESTIMABLES,
} from "./AnalisisFoto.constants";
import type { DanoDetectado } from "./AnalisisFoto.service";
import styles from "./AnalisisFoto.module.css";

interface DanosDetectadosProps {
  danos: DanoDetectado[];
  asignaciones: Record<number, string>;
  onAsignar: (indice: number, pieza: string) => void;
}

export default function DanosDetectados({ danos, asignaciones, onAsignar }: DanosDetectadosProps) {
  if (danos.length === 0) {
    return (
      <section className={styles.panel} aria-label="Daños detectados">
        <h2 className={styles.panelTitulo}>Daños detectados</h2>
        <p className={styles.panelAyuda}>
          Sube una foto y pulsa «Analizar daños» para ver aquí los daños que encontramos.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Daños detectados">
      <h2 className={styles.panelTitulo}>Daños detectados ({danos.length})</h2>
      <p className={styles.panelAyuda}>
        Indica qué pieza tiene cada daño para calcular el costo con el catálogo de precios.
      </p>

      <ul className={styles.listaDanos}>
        {danos.map((dano, indice) => {
          const piezaPropia = PIEZA_PROPIA[dano.tipo_dano];
          const porcentaje = Math.round(dano.confianza * 100);
          const idSelect = `pieza-dano-${indice}`;

          return (
            <li key={indice} className={styles.dano}>
              <div className={styles.danoCabecera}>
                <span className={styles.danoNumero}>{indice + 1}</span>
                <span className={styles.danoNombre}>
                  {NOMBRE_TIPO_DANO[dano.tipo_dano] ?? dano.tipo_dano}
                </span>
                {dano.severidad ? (
                  <Pill color={COLOR_SEVERIDAD[dano.severidad] ?? "warning"}>
                    {NOMBRE_SEVERIDAD[dano.severidad] ?? dano.severidad}
                  </Pill>
                ) : (
                  <span className={styles.sinSeveridad}>Severidad sin estimar</span>
                )}
              </div>

              <div className={styles.confianza}>
                <span>Confianza {porcentaje}%</span>
                <div className={styles.barra} role="presentation">
                  <div className={styles.barraRelleno} style={{ width: `${porcentaje}%` }} />
                </div>
              </div>

              {piezaPropia ? (
                <p className={styles.piezaPropia}>
                  Pieza afectada: <strong>{piezaPropia}</strong>
                  <span> · aún sin precio en el catálogo de estimación</span>
                </p>
              ) : (
                <>
                  <label htmlFor={idSelect} className={styles.etiquetaSelect}>
                    Pieza afectada
                  </label>
                  <select
                    id={idSelect}
                    className={styles.selectPieza}
                    value={asignaciones[indice] ?? ""}
                    onChange={(e) => onAsignar(indice, e.target.value)}
                  >
                    <option value="">Selecciona la pieza...</option>
                    {PIEZAS_ESTIMABLES.map((pieza) => (
                      <option key={pieza} value={pieza}>
                        {pieza}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
