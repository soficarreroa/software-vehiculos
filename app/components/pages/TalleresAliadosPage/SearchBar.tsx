"use client";

import Input from "../../ui/Input/Input";
import Select from "../../ui/Select/Select";
import { BRAND_OPTIONS } from "../../../../lib/constants/brand.constants";
import { BrandOption } from "../../../types/brandOption";
import styles from "./talleresaliados.module.css";

interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilterChange: (value: string) => void;
  options?: BrandOption[];
  /** Valores controlados: permiten que "Limpiar filtros" se vea reflejado. */
  searchValue?: string;
  filterValue?: string;
}

const SearchBar = ({
  onSearch,
  onFilterChange,
  options = BRAND_OPTIONS,
  searchValue = "",
  filterValue = "all",
}: SearchBarProps) => {
  return (
    <div className={styles.searchContainer}>
      <Input
        className={styles.searchInput}
        placeholder="Buscar por nombre, barrio o ciudad..."
        value={searchValue}
        onChange={onSearch}
      />
      <Select
        className={styles.filterSelect}
        options={options}
        value={filterValue}
        onChange={onFilterChange}
      />
    </div>
  );
};

export default SearchBar;