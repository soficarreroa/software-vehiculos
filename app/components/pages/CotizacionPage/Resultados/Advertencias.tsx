"use client";

import Info from "@/app/components/ui/Info/Info";
import type { EstimacionResponse } from "@/app/types/cotizacionResultado";
import styles from "./ResultadoCotizacion.module.css";

export default function Advertencias({ estimacion }: { estimacion: EstimacionResponse }) {
  const { advertencias, danos_ignorados, vehiculo_id, marca, modelo, coincidencia_modelo, nota } = estimacion;

  return (
    <div className={styles.advertencias}>
      {(marca || modelo) && (
        <p className={styles.vehiculoLinea}>
          Vehículo: <strong>{[marca, modelo].filter(Boolean).join(" ")}</strong>
          {coincidencia_modelo === "modelo_base" && " (precio del modelo base del catálogo)"}
          <span className={styles.soloLector}> (id {vehiculo_id})</span>
        </p>
      )}
      {advertencias.length > 0 && (
        <Info severity="warning">
          <ul className={styles.listaSimple}>
            {advertencias.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Info>
      )}
      {danos_ignorados.length > 0 && (
        <Info severity="warning">
          <ul className={styles.listaSimple}>
            {danos_ignorados.map((d) => (
              <li key={d.indice_dano}>
                Daño {d.indice_dano + 1}: {d.motivo}
              </li>
            ))}
          </ul>
        </Info>
      )}
      <p className={styles.nota}>{nota}</p>
    </div>
  );
}
