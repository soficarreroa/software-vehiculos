"use client";

import { useState } from "react";
import { NOMBRE_TIPO_DANO } from "./AnalisisFoto.constants";
import type { DanoDetectado } from "./AnalisisFoto.service";
import styles from "./AnalisisFoto.module.css";

interface FotoConDanosProps {
  url: string;
  danos: DanoDetectado[];
}

const CLASE_SEVERIDAD: Record<string, string> = {
  leve: styles.cajaLeve,
  moderado: styles.cajaModerado,
  grave: styles.cajaGrave,
};

/** Foto con una caja numerada sobre cada daño detectado. */
export default function FotoConDanos({ url, danos }: FotoConDanosProps) {
  const [medidas, setMedidas] = useState<{ ancho: number; alto: number } | null>(null);

  return (
    <figure className={styles.figura}>
      <div className={styles.marco}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Foto del vehículo con los daños detectados"
          className={styles.foto}
          onLoad={(e) =>
            setMedidas({ ancho: e.currentTarget.naturalWidth, alto: e.currentTarget.naturalHeight })
          }
        />
        {medidas &&
          danos.map((dano, indice) => {
            const { x1, y1, x2, y2 } = dano.ubicacion;
            return (
              <div
                key={indice}
                className={`${styles.caja} ${CLASE_SEVERIDAD[dano.severidad ?? ""] ?? styles.cajaLeve}`}
                style={{
                  left: `${(x1 / medidas.ancho) * 100}%`,
                  top: `${(y1 / medidas.alto) * 100}%`,
                  width: `${((x2 - x1) / medidas.ancho) * 100}%`,
                  height: `${((y2 - y1) / medidas.alto) * 100}%`,
                }}
              >
                <span className={styles.numeroCaja}>{indice + 1}</span>
              </div>
            );
          })}
      </div>
      <figcaption className={styles.leyenda}>
        {danos.map((dano, indice) => (
          <span key={indice}>
            {indice + 1} {NOMBRE_TIPO_DANO[dano.tipo_dano] ?? dano.tipo_dano}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
