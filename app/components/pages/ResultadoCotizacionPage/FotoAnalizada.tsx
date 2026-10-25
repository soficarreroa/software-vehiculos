"use client";

import { useState } from "react";
import type { DanoDetectado } from "@/app/types/cotizacionResultado";
import { etiquetaDano } from "./ResultadoCotizacion.utils";
import styles from "./ResultadoCotizacion.module.css";

interface FotoAnalizadaProps {
  src: string;
  danos: DanoDetectado[];
  resaltado: number | null;
  onResaltar: (indice: number | null) => void;
}

/** Foto con las cajas numeradas de cada daño (coordenadas en píxeles de la imagen original). */
export default function FotoAnalizada({ src, danos, resaltado, onResaltar }: FotoAnalizadaProps) {
  const [dimensiones, setDimensiones] = useState<{ ancho: number; alto: number } | null>(null);

  const tamanoEtiqueta = dimensiones ? Math.max(dimensiones.ancho, dimensiones.alto) * 0.035 : 0;

  return (
    <figure className={styles.foto}>
      <div className={styles.fotoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Foto analizada del vehículo con ${danos.length} daño(s) marcado(s)`}
          className={styles.fotoImg}
          onLoad={(e) =>
            setDimensiones({
              ancho: e.currentTarget.naturalWidth,
              alto: e.currentTarget.naturalHeight,
            })
          }
        />
        {dimensiones && (
          <svg
            className={styles.overlay}
            viewBox={`0 0 ${dimensiones.ancho} ${dimensiones.alto}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {danos.map((dano, i) => {
              const { x1, y1, x2, y2 } = dano.ubicacion;
              const claseSeveridad = dano.severidad ? styles[`sev_${dano.severidad}`] : styles.sev_sin;
              const activo = resaltado === i;
              const alto = tamanoEtiqueta * 1.3;
              const etiquetaY = Math.max(0, y1 - alto);
              return (
                <g
                  key={`${dano.clase_yolo}-${i}`}
                  className={`${styles.cajaGrupo} ${claseSeveridad} ${activo ? styles.cajaActiva : ""}`}
                  onMouseEnter={() => onResaltar(i)}
                  onMouseLeave={() => onResaltar(null)}
                >
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} className={styles.caja} />
                  <rect x={x1} y={etiquetaY} width={tamanoEtiqueta * 1.6} height={alto} className={styles.cajaEtiqueta} />
                  <text
                    x={x1 + tamanoEtiqueta * 0.8}
                    y={etiquetaY + alto * 0.78}
                    fontSize={tamanoEtiqueta}
                    textAnchor="middle"
                    className={styles.cajaNumero}
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <figcaption className={styles.fotoLeyenda}>
        {danos.map((d, i) => `${i + 1}. ${etiquetaDano(d.tipo_dano)}`).join(" · ")}
      </figcaption>
    </figure>
  );
}
