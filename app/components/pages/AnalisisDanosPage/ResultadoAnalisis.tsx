"use client";

import Info from "@/app/components/ui/Info/Info";
import Pill from "@/app/components/ui/Pill/Pill";
import {
  COLOR_SEVERIDAD,
  NOMBRE_SEVERIDAD,
  NOMBRE_TIPO_DANO,
} from "./AnalisisDanos.constants";
import type { ResultadoAnalisis as Resultado } from "./AnalisisDanos.service";
import styles from "./AnalisisDanosPage.module.css";

export default function ResultadoAnalisis({ resultado }: { resultado: Resultado }) {
  const danos = resultado.danos_detectados;

  if (danos.length === 0) {
    return (
      <Info severity="warning">
        {resultado.mensaje ?? "No se detectaron daños en la foto"}
      </Info>
    );
  }

  return (
    <section className={styles.resultado} aria-label="Resultado del análisis">
      <h2 className={styles.resultadoTitulo}>
        {danos.length === 1 ? "Se detectó 1 daño" : `Se detectaron ${danos.length} daños`}
      </h2>

      <ul className={styles.listaDanos}>
        {danos.map((dano, indice) => (
          <li key={`${dano.tipo_dano}-${indice}`} className={styles.dano}>
            <div>
              <div className={styles.danoNombre}>
                {NOMBRE_TIPO_DANO[dano.tipo_dano] ?? dano.tipo_dano}
              </div>
              <div className={styles.danoConfianza}>
                Confianza: {Math.round(dano.confianza * 100)}%
              </div>
            </div>
            {dano.severidad ? (
              <Pill color={COLOR_SEVERIDAD[dano.severidad] ?? "warning"}>
                {NOMBRE_SEVERIDAD[dano.severidad] ?? dano.severidad}
              </Pill>
            ) : (
              <span className={styles.sinSeveridad}>Severidad sin estimar</span>
            )}
          </li>
        ))}
      </ul>

      {/* TODO (tarea #38, Sofia): aquí va el costo estimado total cuando exista el cálculo.
          Hasta entonces se deja este espacio reservado. */}
      <div className={styles.costo}>
        <div className={styles.costoTitulo}>Costo estimado</div>
        <p className={styles.costoTexto}>El estimado de costo estará disponible próximamente.</p>
      </div>
    </section>
  );
}
