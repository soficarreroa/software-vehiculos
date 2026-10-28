"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./adminDashboardPage.module.css";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

interface AdminCalendarProps {
  hoy: Date;
}

/** Calendario mensual (semana desde lunes) que resalta el día de hoy. */
export default function AdminCalendar({ hoy }: AdminCalendarProps) {
  const [mes, setMes] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));

  const tituloBase = mes.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const titulo = tituloBase.charAt(0).toUpperCase() + tituloBase.slice(1); // "Octubre de 2026"
  const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  // getDay(): 0 = domingo. Lo pasamos a 0 = lunes.
  const offset = (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7;

  const celdas: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  const esHoy = (dia: number) =>
    dia === hoy.getDate() &&
    mes.getMonth() === hoy.getMonth() &&
    mes.getFullYear() === hoy.getFullYear();

  const moverMes = (delta: number) =>
    setMes((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  return (
    <div className={styles.calendar} role="dialog" aria-label="Calendario">
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.calendarNav}
          onClick={() => moverMes(-1)}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className={styles.calendarTitle}>{titulo}</span>
        <button
          type="button"
          className={styles.calendarNav}
          onClick={() => moverMes(1)}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.calendarGrid}>
        {DIAS.map((d, i) => (
          <span key={`${d}-${i}`} className={styles.calendarWeekday}>
            {d}
          </span>
        ))}
        {celdas.map((dia, i) =>
          dia === null ? (
            <span key={`vacio-${i}`} />
          ) : (
            <span
              key={dia}
              className={`${styles.calendarDay} ${esHoy(dia) ? styles.calendarToday : ""}`}
              aria-current={esHoy(dia) ? "date" : undefined}
            >
              {dia}
            </span>
          )
        )}
      </div>

      <button
        type="button"
        className={styles.calendarTodayBtn}
        onClick={() => setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1))}
      >
        Ir a hoy
      </button>
    </div>
  );
}
