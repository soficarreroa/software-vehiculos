"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Search } from "lucide-react";
import AdminCalendar from "./AdminCalendar";
import { formatFechaCorta } from "./AdminDashboard.utils";
import styles from "./adminDashboardPage.module.css";

interface AdminTopbarProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  hayNotificaciones: boolean;
  onAbrirNotificaciones: () => void;
}

export default function AdminTopbar({
  busqueda,
  onBusquedaChange,
  hayNotificaciones,
  onAbrirNotificaciones,
}: AdminTopbarProps) {
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [hoy] = useState(() => new Date());
  const calendarioRef = useRef<HTMLDivElement>(null);

  // Cierra el calendario al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!calendarioAbierto) return;
    const onClick = (e: MouseEvent) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target as Node)) {
        setCalendarioAbierto(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarioAbierto(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [calendarioAbierto]);

  return (
    <div className={styles.topbarRow}>
      <label className={styles.searchBox}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          className={styles.searchField}
          placeholder="Buscar por marca, placa, dueño, taller o ID..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          aria-label="Buscar en el panel"
        />
      </label>

      <div className={styles.topbarRight}>
        <div className={styles.calendarWrap} ref={calendarioRef}>
          <button
            type="button"
            className={styles.dateChip}
            onClick={() => setCalendarioAbierto((abierto) => !abierto)}
            aria-expanded={calendarioAbierto}
            aria-haspopup="dialog"
          >
            <CalendarDays size={14} aria-hidden="true" />
            {formatFechaCorta(hoy)}
          </button>
          {calendarioAbierto && <AdminCalendar hoy={hoy} />}
        </div>

        <button
          type="button"
          className={styles.bellButton}
          onClick={onAbrirNotificaciones}
          aria-label="Notificaciones"
        >
          <Bell size={18} aria-hidden="true" />
          {hayNotificaciones && <span className={styles.bellDot} />}
        </button>

        <span className={styles.topbarDivider} aria-hidden="true" />

        <div className={styles.adminUser}>
          <span className={styles.avatar}>A</span>
          <span className={styles.adminName}>Administrador</span>
        </div>
      </div>
    </div>
  );
}
