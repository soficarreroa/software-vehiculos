"use client";

import { useEffect, useRef } from "react";
import styles from "./adminDashboardPage.module.css";

interface NotificationsModalProps {
  pendientes: number;
  onClose: () => void;
}

export default function NotificationsModal({ pendientes, onClose }: NotificationsModalProps) {
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    botonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mensaje =
    pendientes > 0
      ? `Tienes ${pendientes} ${
          pendientes === 1 ? "solicitud" : "solicitudes"
        } de verificación de talleres pendientes de revisión.`
      : "No tienes solicitudes de verificación de talleres pendientes.";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="notif-titulo" className={styles.modalTitle}>
          Notificaciones Administrador
        </h2>
        <p className={styles.modalText}>{mensaje}</p>
        <div className={styles.modalActions}>
          <button ref={botonRef} type="button" className={styles.modalButton} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
