"use client";

import { useEffect, useState } from "react";
import type { DanoDetectado } from "./AnalisisFoto.service";
import { estimacionService, type Estimacion } from "./Estimacion.service";

interface Estado {
  clave: string;
  estimacion: Estimacion | null;
  error: string | null;
}

/**
 * Pide el costo estimado cuando hay vehículo y al menos un daño con pieza asignada.
 * `asignaciones` va por índice de daño: { 0: "Puerta", 2: "Capó" }.
 */
export function useEstimacion(
  vehiculoId: number | null,
  danos: DanoDetectado[],
  asignaciones: Record<number, string>,
) {
  const [estado, setEstado] = useState<Estado | null>(null);

  const asignadas = Object.entries(asignaciones)
    .filter(([, pieza]) => Boolean(pieza))
    .map(([indice, pieza]) => ({ indice_dano: Number(indice), pieza }));

  const listo = vehiculoId !== null && danos.length > 0 && asignadas.length > 0;
  const clave = JSON.stringify({ vehiculoId, danos: danos.length, asignadas });

  useEffect(() => {
    if (!listo || vehiculoId === null) return;
    let activo = true;
    const paraEstimar = danos.map((dano) => ({
      tipo_dano: dano.tipo_dano,
      severidad: dano.severidad,
      confianza: dano.confianza,
    }));

    estimacionService
      .estimar(vehiculoId, paraEstimar, asignadas)
      .then((estimacion) => {
        if (activo) setEstado({ clave, estimacion, error: null });
      })
      .catch((err: unknown) => {
        if (activo) {
          setEstado({
            clave,
            estimacion: null,
            error: err instanceof Error ? err.message : "No se pudo calcular el costo estimado.",
          });
        }
      });

    return () => {
      activo = false;
    };
    // `clave` resume vehículo, daños y asignaciones; evita repetir la petición sin cambios.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const vigente = listo && estado?.clave === clave ? estado : null;

  return {
    listo,
    estimando: listo && !vigente,
    estimacion: vigente?.estimacion ?? null,
    error: vigente?.error ?? null,
  };
}
