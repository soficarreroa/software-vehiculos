"use client";

import { Filter } from "lucide-react";
import {
  ESTADO_OPTIONS,
  FILTROS_POR_TAB,
  ROL_LABELS,
  truncarId,
  type FiltrosAdmin,
  type TabAdmin,
} from "./AdminDashboard.utils";
import { ROLE_OPTIONS } from "./AdminDashboard.constants";
import styles from "./adminDashboardPage.module.css";

interface AdminFiltersProps {
  filtros: FiltrosAdmin;
  tabActiva: TabAdmin;
  marcas: string[];
  duenos: string[];
  categorias: string[];
  onChange: (campo: keyof FiltrosAdmin, valor: string) => void;
  onLimpiar: () => void;
}

export default function AdminFilters({
  filtros,
  tabActiva,
  marcas,
  duenos,
  categorias,
  onChange,
  onLimpiar,
}: AdminFiltersProps) {
  const clase = (campo: keyof FiltrosAdmin) =>
    `${styles.filterSelect} ${FILTROS_POR_TAB[tabActiva].includes(campo) ? "" : styles.filterMuted}`;

  return (
    <div className={styles.filtersRow}>
      <span className={styles.filtersLabel}>
        <Filter size={14} aria-hidden="true" />
        Filtros multicategoría:
      </span>

      <select
        className={clase("marca")}
        value={filtros.marca}
        onChange={(e) => onChange("marca", e.target.value)}
        aria-label="Filtrar por marca"
      >
        <option value="">Todas las Marcas</option>
        {marcas.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        className={clase("dueno")}
        value={filtros.dueno}
        onChange={(e) => onChange("dueno", e.target.value)}
        aria-label="Filtrar por dueño"
      >
        <option value="">Todos los Dueños</option>
        {duenos.map((d) => (
          <option key={d} value={d}>
            {truncarId(d)}
          </option>
        ))}
      </select>

      {/* El backend aún no expone vehículos al admin, así que no hay placas que filtrar. */}
      <input
        type="text"
        className={`${styles.filterInput} ${styles.filterMuted}`}
        placeholder="Placa (ej: ABC123)"
        value={filtros.placa}
        onChange={(e) => onChange("placa", e.target.value.toUpperCase())}
        disabled
        title="Disponible cuando el backend exponga los vehículos al administrador"
        aria-label="Filtrar por placa"
      />

      <select
        className={clase("estado")}
        value={filtros.estado}
        onChange={(e) => onChange("estado", e.target.value)}
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los Estados</option>
        {ESTADO_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={clase("rol")}
        value={filtros.rol}
        onChange={(e) => onChange("rol", e.target.value)}
        aria-label="Filtrar por rol"
      >
        <option value="">Todos los Roles</option>
        {ROLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {ROL_LABELS[o.value] ?? o.label}
          </option>
        ))}
      </select>

      <select
        className={clase("categoria")}
        value={filtros.categoria}
        onChange={(e) => onChange("categoria", e.target.value)}
        aria-label="Filtrar por categoría de taller"
      >
        <option value="">Todas las Categorías Taller</option>
        {categorias.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button type="button" className={styles.clearFilters} onClick={onLimpiar}>
        Limpiar Filtros
      </button>
    </div>
  );
}
