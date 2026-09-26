// app/components/pages/TalleresAliadosPage/GeoEstado.tsx
"use client";

import { ClaveMensaje, MENSAJES_ESTADO } from "./TalleresAliados.constants";
import styles from "./talleresaliados.module.css";

interface GeoEstadoProps {
  /** null = no hay nada que explicar, se muestran las tarjetas. */
  clave: ClaveMensaje | null;
  /** Qué hace el botón del estado. La página decide según la clave. */
  onAccion?: () => void;
}

/**
 * Único lugar donde se dibujan los estados vacíos y de error de la
 * página de talleres. Reutiliza las clases .emptyState / .emptyIcon /
 * .emptyTitle / .emptyText que ya existen en el módulo CSS.
 */
export default function GeoEstado({ clave, onAccion }: GeoEstadoProps) {
  if (!clave) return null;

  const mensaje = MENSAJES_ESTADO[clave];

  return (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <div className={styles.emptyIcon} aria-hidden="true">
        {mensaje.icono}
      </div>
      <h2 className={styles.emptyTitle}>{mensaje.titulo}</h2>
      <p className={styles.emptyText}>{mensaje.texto}</p>

      {mensaje.accion && onAccion && (
        <div className={styles.emptyActions}>
          <button type="button" className={styles.retryButton} onClick={onAccion}>
            {mensaje.accion}
          </button>
        </div>
      )}
    </div>
  );
}