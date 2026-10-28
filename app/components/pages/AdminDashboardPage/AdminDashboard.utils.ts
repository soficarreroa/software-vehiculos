export type TabAdmin = "talleres" | "usuarios" | "catalogo";

export interface FiltrosAdmin {
  marca: string;
  dueno: string;
  placa: string;
  estado: string;
  rol: string;
  categoria: string;
}

export const FILTROS_INICIALES: FiltrosAdmin = {
  marca: "",
  dueno: "",
  placa: "",
  estado: "",
  rol: "",
  categoria: "",
};

/** Filtros que tienen sentido en cada pestaña (los demás se atenúan y se ignoran). */
export const FILTROS_POR_TAB: Record<TabAdmin, (keyof FiltrosAdmin)[]> = {
  talleres: ["dueno", "estado", "categoria"],
  usuarios: ["estado", "rol"],
  catalogo: ["marca"],
};

export const TABS_ADMIN: { id: TabAdmin; label: string }[] = [
  { id: "talleres", label: "Gestión de Talleres" },
  { id: "usuarios", label: "Gestión de Usuarios y Roles" },
  { id: "catalogo", label: "Catálogo de Precios" },
];

export const ESTADO_OPTIONS = [
  { value: "pendiente", label: "Taller pendiente" },
  { value: "verificado", label: "Taller verificado" },
  { value: "activo", label: "Usuario activo" },
  { value: "inactivo", label: "Usuario inactivo" },
];

/** Cómo se muestra cada rol del backend (cliente / taller / admin). */
export const ROL_LABELS: Record<string, string> = {
  cliente: "Cliente",
  taller: "Gerente Taller",
  admin: "Admin Global",
};

export const truncarId = (id: string) =>
  id && id.length > 10 ? `${id.slice(0, 10)}...` : id ?? "-";

/** 9021 -> "#TL-9021" */
export const formatIdTaller = (id: number) => `#TL-${String(id).padStart(4, "0")}`;

export const formatMoneda = (valor: number | null, moneda: string) =>
  valor === null || valor === undefined
    ? "—"
    : `$ ${new Intl.NumberFormat("en-US").format(valor)} ${moneda}`;

/** "Oct 25, 2026" */
export const formatFechaCorta = (fecha: Date) =>
  fecha.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const unicosOrdenados = (valores: (string | null | undefined)[]) =>
  Array.from(new Set(valores.filter((v): v is string => !!v))).sort((a, b) =>
    a.localeCompare(b, "es")
  );
