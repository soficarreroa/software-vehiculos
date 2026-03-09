"use client";

import Input from "../../ui/Input/Input";
import Select from "../../ui/Select/Select";
import styles from "./talleresaliados.module.css";

interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilterChange: (value: string) => void;
}

const brandOptions = [
  { value: "", label: "Marcas" },
];

export default function SearchBar({
  onSearch,
  onFilterChange,
}: SearchBarProps) {
  return (
    <div className={styles.searchContainer}>
      <Input
        className={styles.searchInput}
        placeholder="Buscar por nombre, barrio o ciudad..."
        onChange={onSearch}
      />
      <Select
        className={styles.filterSelect}
        options={brandOptions}
        value=""
        onChange={onFilterChange}
      />
    </div>
  );
}
