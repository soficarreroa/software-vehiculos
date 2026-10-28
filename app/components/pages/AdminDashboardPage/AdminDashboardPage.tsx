"use client";

import { useState, useEffect } from "react";
import Info from "../../ui/Info/Info";
import AdminTopbar from "./AdminTopbar";
import AdminFilters from "./AdminFilters";
import NotificationsModal from "./NotificationsModal";
import styles from "./adminDashboardPage.module.css";
import {
  adminService,
  ResumenAdmin,
  TallerAdmin,
  UsuarioAdmin,
  PiezaAdmin,
  CatalogoPrecioAdmin,
} from "./AdminDashboard.service";
import { ERROR_MESSAGES, ROLE_OPTIONS, MONEDA_OPTIONS } from "./AdminDashboard.constants";
import {
  FILTROS_INICIALES,
  ROL_LABELS,
  TABS_ADMIN,
  formatIdTaller,
  formatMoneda,
  unicosOrdenados,
  type FiltrosAdmin,
  type TabAdmin,
} from "./AdminDashboard.utils";

const rolePillClass = (rol: string) => {
  const variantes: Record<string, string> = {
    cliente: styles.rolePillCliente,
    taller: styles.rolePillTaller,
    admin: styles.rolePillAdmin,
  };
  return `${styles.rolePill} ${variantes[rol] ?? ""}`;
};

const NOMBRES_RECURSOS = {
  resumen: "el resumen general",
  talleres: "la lista de talleres",
  usuarios: "la lista de usuarios",
  piezas: "el catálogo de piezas",
  catalogo: "el catálogo de precios",
} as const;

const FORM_PRECIO_INICIAL = {
  piezaId: "",
  marca: "",
  modelo: "",
  anoDesde: "",
  anoHasta: "",
  precioRepuesto: "",
  precioManoObra: "",
  precioPintura: "",
  moneda: "COP",
};

const AdminDashboardPage = () => {
  const [resumen, setResumen] = useState<ResumenAdmin | null>(null);
  const [talleres, setTalleres] = useState<TallerAdmin[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [piezas, setPiezas] = useState<PiezaAdmin[]>([]);
  const [catalogoPrecios, setCatalogoPrecios] = useState<CatalogoPrecioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizandoTallerId, setActualizandoTallerId] = useState<number | null>(null);
  const [cambiandoRolId, setCambiandoRolId] = useState<number | null>(null);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<Record<number, string>>({});
  const [formPrecio, setFormPrecio] = useState(FORM_PRECIO_INICIAL);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [eliminandoPrecioId, setEliminandoPrecioId] = useState<number | null>(null);

  // Estado de la nueva interfaz
  const [tabActiva, setTabActiva] = useState<TabAdmin>("talleres");
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<FiltrosAdmin>(FILTROS_INICIALES);
  const [notifAbiertas, setNotifAbiertas] = useState(false);
  const [notifVistas, setNotifVistas] = useState(0);

  useEffect(() => {
    let obsoleto = false;

    const cargarDatos = async () => {
      setCargando(true);
      setError(null);

      const resultados = await Promise.allSettled([
        adminService.getResumen(),
        adminService.getTalleres(),
        adminService.getUsuarios(),
        adminService.getPiezas(),
        adminService.getCatalogoPrecios(),
      ]);

      if (obsoleto) return; // esta ejecución ya no es la más reciente, no pisar el estado

      const [resumenR, talleresR, usuariosR, piezasR, catalogoR] = resultados;

      if (resumenR.status === "fulfilled") setResumen(resumenR.value);
      if (talleresR.status === "fulfilled") setTalleres(talleresR.value);
      if (usuariosR.status === "fulfilled") setUsuarios(usuariosR.value);
      if (piezasR.status === "fulfilled") setPiezas(piezasR.value);
      if (catalogoR.status === "fulfilled") setCatalogoPrecios(catalogoR.value);

      const claves = ["resumen", "talleres", "usuarios", "piezas", "catalogo"] as const;
      const fallidos = resultados
        .map((r, i) => (r.status === "rejected" ? claves[i] : null))
        .filter((clave): clave is (typeof claves)[number] => clave !== null);

      if (fallidos.length > 0) {
        resultados.forEach((r) => {
          if (r.status === "rejected") console.error(r.reason);
        });
        const nombres = fallidos.map((clave) => NOMBRES_RECURSOS[clave]).join(", ");
        setError(`No se pudo cargar ${nombres}. El resto de la información sí está actualizada.`);
      }

      setCargando(false);
    };

    cargarDatos();

    return () => {
      obsoleto = true;
    };
  }, []);

  const handleVerificarTaller = async (tallerId: number, verificado: boolean) => {
    setActualizandoTallerId(tallerId);
    try {
      await adminService.verificarTaller(tallerId, verificado);
      setTalleres((prev) =>
        prev.map((t) => (t.id === tallerId ? { ...t, verificado } : t))
      );
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES.ACTION_ERROR);
    } finally {
      setActualizandoTallerId(null);
    }
  };

  const handleRevocarTaller = (taller: TallerAdmin) => {
    const confirmar = window.confirm(
      `¿Seguro que quieres revocar la aprobación de "${taller.nombre}"? Dejará de aparecer como taller verificado.`
    );
    if (!confirmar) return;
    handleVerificarTaller(taller.id, false);
  };

  const handleCambiarRol = async (usuario: UsuarioAdmin, nuevoRol: string) => {
    setCambiandoRolId(usuario.id);
    try {
      await adminService.cambiarRolUsuario(usuario.id, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, rol: nuevoRol } : u))
      );
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES.ACTION_ERROR);
      setRolSeleccionado((prev) => ({ ...prev, [usuario.id]: usuario.rol }));
    } finally {
      setCambiandoRolId(null);
    }
  };

  const handleSelectChange = (usuario: UsuarioAdmin, valor: string) => {
    if (valor === usuario.rol) return;

    const confirmar = window.confirm(
      `¿Seguro que quieres cambiar el rol de ${usuario.nombre_completo} de "${usuario.rol}" a "${valor}"?`
    );

    if (!confirmar) {
      setRolSeleccionado((prev) => ({ ...prev, [usuario.id]: usuario.rol }));
      return;
    }

    setRolSeleccionado((prev) => ({ ...prev, [usuario.id]: valor }));
    handleCambiarRol(usuario, valor);
  };

  const handleToggleEstado = async (usuario: UsuarioAdmin) => {
    const nuevoEstado = !usuario.activo;

    if (!nuevoEstado) {
      const confirmar = window.confirm(
        `¿Seguro que quieres desactivar la cuenta de ${usuario.nombre_completo}? No podrá iniciar sesión mientras esté desactivada.`
      );
      if (!confirmar) return;
    }

    setCambiandoEstadoId(usuario.id);
    try {
      await adminService.cambiarEstadoUsuario(usuario.id, nuevoEstado);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, activo: nuevoEstado } : u))
      );
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES.ACTION_ERROR);
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  const handleFormPrecioChange = (
    campo: keyof typeof FORM_PRECIO_INICIAL,
    valor: string
  ) => {
    setFormPrecio((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleCrearPrecio = async () => {
    const {
      piezaId,
      marca,
      modelo,
      anoDesde,
      anoHasta,
      precioRepuesto,
      precioManoObra,
      precioPintura,
      moneda,
    } = formPrecio;

    if (!piezaId || !marca.trim() || !modelo.trim() || !anoDesde || !anoHasta || !precioRepuesto) {
      setError("Completa pieza, marca, modelo, años y precio de repuesto.");
      return;
    }

    const piezaSeleccionada = piezas.find((p) => p.id === Number(piezaId));

    setGuardandoPrecio(true);
    try {
      const nuevo = await adminService.crearPrecioCatalogo({
        pieza_id: Number(piezaId),
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano_desde: Number(anoDesde),
        ano_hasta: Number(anoHasta),
        precio_repuesto: Number(precioRepuesto),
        precio_mano_obra: precioManoObra ? Number(precioManoObra) : null,
        precio_pintura: precioPintura ? Number(precioPintura) : null,
        moneda,
      });
      setCatalogoPrecios((prev) => [
        { ...nuevo, pieza_nombre: piezaSeleccionada?.nombre ?? "Pieza desconocida" },
        ...prev,
      ]);
      setFormPrecio(FORM_PRECIO_INICIAL);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES.ACTION_ERROR);
    } finally {
      setGuardandoPrecio(false);
    }
  };

  const handleEliminarPrecio = async (precio: CatalogoPrecioAdmin) => {
    const confirmar = window.confirm(
      `¿Eliminar el precio de "${precio.pieza_nombre}" para ${precio.marca} ${precio.modelo} (${precio.ano_desde}-${precio.ano_hasta})?`
    );
    if (!confirmar) return;

    setEliminandoPrecioId(precio.id);
    try {
      await adminService.eliminarPrecioCatalogo(precio.id);
      setCatalogoPrecios((prev) => prev.filter((p) => p.id !== precio.id));
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES.ACTION_ERROR);
    } finally {
      setEliminandoPrecioId(null);
    }
  };

  // ---- Filtros y búsqueda global ------------------------------------------

  const handleFiltroChange = (campo: keyof FiltrosAdmin, valor: string) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setBusqueda("");
  };

  const texto = busqueda.trim().toLowerCase();
  const coincide = (...campos: (string | number | null | undefined)[]) =>
    !texto || campos.some((c) => String(c ?? "").toLowerCase().includes(texto));

  const talleresFiltrados = [...talleres]
    .filter((t) => {
      const estado = t.verificado ? "verificado" : "pendiente";
      if ((filtros.estado === "pendiente" || filtros.estado === "verificado") && estado !== filtros.estado)
        return false;
      if (filtros.categoria && t.categoria !== filtros.categoria) return false;
      if (filtros.dueno && t.propietario_id !== filtros.dueno) return false;
      return coincide(
        t.nombre,
        t.categoria,
        t.id,
        formatIdTaller(t.id),
        t.propietario_id,
        t.direccion,
        t.email
      );
    })
    .sort((a, b) => Number(a.verificado) - Number(b.verificado));

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtros.estado === "activo" && !u.activo) return false;
    if (filtros.estado === "inactivo" && u.activo) return false;
    if (filtros.rol && u.rol !== filtros.rol) return false;
    return coincide(u.nombre_completo, u.correo, u.rol, ROL_LABELS[u.rol], u.id);
  });

  const catalogoFiltrado = catalogoPrecios.filter((precio) => {
    if (filtros.marca && precio.marca !== filtros.marca) return false;
    return coincide(
      precio.pieza_nombre,
      precio.marca,
      precio.modelo,
      precio.moneda,
      precio.ano_desde,
      precio.ano_hasta
    );
  });

  const marcasDisponibles = unicosOrdenados(catalogoPrecios.map((p) => p.marca));
  const duenosDisponibles = unicosOrdenados(talleres.map((t) => t.propietario_id));
  const categoriasDisponibles = unicosOrdenados(talleres.map((t) => t.categoria));

  // ---- Notificaciones -----------------------------------------------------

  const talleresPendientes =
    talleres.length > 0
      ? talleres.filter((t) => !t.verificado).length
      : resumen?.talleres_pendientes ?? 0;
  const hayNotificaciones = talleresPendientes > notifVistas;

  const cerrarNotificaciones = () => {
    setNotifAbiertas(false);
    setNotifVistas(talleresPendientes);
  };

  const piezaOptions = [
    { value: "", label: "Pieza (ej: Puerta Izq)" },
    ...piezas.map((p) => ({
      value: String(p.id),
      label: p.codigo ? `${p.nombre} (${p.codigo})` : p.nombre,
    })),
  ];

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <AdminTopbar
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          hayNotificaciones={hayNotificaciones}
          onAbrirNotificaciones={() => setNotifAbiertas(true)}
        />
        <AdminFilters
          filtros={filtros}
          tabActiva={tabActiva}
          marcas={marcasDisponibles}
          duenos={duenosDisponibles}
          categorias={categoriasDisponibles}
          onChange={handleFiltroChange}
          onLimpiar={limpiarFiltros}
        />
      </header>

      <main className={styles.main}>
        <div className={styles.headerRow}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Panel de Administración Global</h1>
            <span className={styles.roleBadge}>ROL: ADMIN</span>
          </div>
          <p className={styles.subtitle}>
            Supervisión del sistema, verificación de talleres y gestión de usuarios
          </p>
        </div>

        {error && (
          <Info severity="error">
            <span>{error}</span>
          </Info>
        )}

        {cargando ? (
          <p className={styles.loadingText}>Cargando panel...</p>
        ) : (
          <>
            <section className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div>
                  <div className={styles.kpiLabel}>Talleres Pendientes</div>
                  <div className={styles.kpiNumber}>
                    {new Intl.NumberFormat("en-US").format(talleresPendientes)}
                  </div>
                </div>
                <div className={`${styles.kpiIconBox} ${styles.kpiIconWarning}`}>🏪</div>
              </div>

              <div className={styles.kpiCard}>
                <div>
                  <div className={styles.kpiLabel}>Usuarios Totales</div>
                  <div className={styles.kpiNumber}>
                    {new Intl.NumberFormat("en-US").format(resumen?.total_usuarios ?? 0)}
                  </div>
                </div>
                <div className={`${styles.kpiIconBox} ${styles.kpiIconInfo}`}>👤</div>
              </div>

              <div className={styles.kpiCard}>
                <div>
                  <div className={styles.kpiLabel}>Vehículos Registrados</div>
                  <div className={styles.kpiNumber}>
                    {new Intl.NumberFormat("en-US").format(resumen?.total_vehiculos ?? 0)}
                  </div>
                </div>
                <div className={`${styles.kpiIconBox} ${styles.kpiIconSuccess}`}>🚙</div>
              </div>
            </section>

            <div className={styles.tabs} role="tablist">
              {TABS_ADMIN.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={tabActiva === tab.id}
                  className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ""}`}
                  onClick={() => setTabActiva(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {tabActiva === "talleres" && (
              <section className={styles.card}>
                {talleresFiltrados.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🏪</span>
                    <p className={styles.emptyText}>
                      {talleres.length === 0
                        ? "Aún no hay talleres registrados."
                        : "Ningún taller coincide con la búsqueda o los filtros."}
                    </p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nombre Taller</th>
                          <th>Categoría</th>
                          <th>ID</th>
                          <th>Estado</th>
                          <th className={styles.thRight}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {talleresFiltrados.map((taller) => (
                          <tr key={taller.id}>
                            <td className={styles.cellStrong}>{taller.nombre}</td>
                            <td className={styles.cellText}>{taller.categoria}</td>
                            <td className={styles.cellId}>{formatIdTaller(taller.id)}</td>
                            <td>
                              <span
                                className={`${styles.statusPill} ${
                                  taller.verificado ? styles.statusOk : styles.statusWarn
                                }`}
                              >
                                {taller.verificado ? "Verificado" : "Pendiente"}
                              </span>
                            </td>
                            <td>
                              <div className={styles.tableActions}>
                                {taller.verificado ? (
                                  <>
                                    <button type="button" className={styles.btnGhost} disabled>
                                      Aprobado
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.btnOutline}
                                      disabled={actualizandoTallerId === taller.id}
                                      onClick={() => handleRevocarTaller(taller)}
                                    >
                                      Revocar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className={styles.btnGreen}
                                      disabled={actualizandoTallerId === taller.id}
                                      onClick={() => handleVerificarTaller(taller.id, true)}
                                    >
                                      Aprobar
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.btnRed}
                                      disabled={actualizandoTallerId === taller.id}
                                      onClick={() => handleVerificarTaller(taller.id, false)}
                                    >
                                      Rechazar
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {tabActiva === "usuarios" && (
              <section className={styles.card}>
                {usuariosFiltrados.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🔍</span>
                    <p className={styles.emptyText}>
                      {usuarios.length === 0
                        ? "Aún no hay usuarios registrados."
                        : "Ningún usuario coincide con la búsqueda o los filtros."}
                    </p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Correo</th>
                          <th>Rol Actual</th>
                          <th>Estado</th>
                          <th className={styles.thRight}>Cuenta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuariosFiltrados.map((usuario) => (
                          <tr key={usuario.id}>
                            <td className={styles.cellStrong}>{usuario.nombre_completo}</td>
                            <td className={styles.cellText}>{usuario.correo}</td>
                            <td>
                              {/* El pill es un <select>: sigue permitiendo cambiar el rol. */}
                              <select
                                className={`${rolePillClass(
                                  rolSeleccionado[usuario.id] ?? usuario.rol
                                )} ${styles.rolSelect}`}
                                value={rolSeleccionado[usuario.id] ?? usuario.rol}
                                disabled={cambiandoRolId === usuario.id}
                                onChange={(e) => handleSelectChange(usuario, e.target.value)}
                                aria-label={`Cambiar rol de ${usuario.nombre_completo}`}
                              >
                                {ROLE_OPTIONS.map((opcion) => (
                                  <option key={opcion.value} value={opcion.value}>
                                    {ROL_LABELS[opcion.value] ?? opcion.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <span
                                className={`${styles.statusPill} ${
                                  usuario.activo ? styles.statusOk : styles.statusOff
                                }`}
                              >
                                {usuario.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td>
                              <div className={styles.tableActions}>
                                <button
                                  type="button"
                                  className={usuario.activo ? styles.btnRed : styles.btnGreen}
                                  disabled={cambiandoEstadoId === usuario.id}
                                  onClick={() => handleToggleEstado(usuario)}
                                >
                                  {usuario.activo ? "Desactivar" : "Activar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {tabActiva === "catalogo" && (
              <>
                <section className={`${styles.card} ${styles.priceForm}`}>
                  <h2 className={styles.formTitle}>
                    <span aria-hidden="true">🏷️</span> Asignar Nuevo Precio de Catálogo
                  </h2>

                  <div className={styles.priceFormMain}>
                    <select
                      className={styles.formControl}
                      value={formPrecio.piezaId}
                      onChange={(e) => handleFormPrecioChange("piezaId", e.target.value)}
                      aria-label="Pieza"
                    >
                      {piezaOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className={styles.formControl}
                      placeholder="Marca (ej: Toyota)"
                      value={formPrecio.marca}
                      onChange={(e) => handleFormPrecioChange("marca", e.target.value)}
                      aria-label="Marca"
                    />
                    <input
                      className={styles.formControl}
                      type="number"
                      placeholder="Precio Repuesto ($)"
                      value={formPrecio.precioRepuesto}
                      onChange={(e) => handleFormPrecioChange("precioRepuesto", e.target.value)}
                      aria-label="Precio repuesto"
                    />
                    <button
                      type="button"
                      className={styles.btnPrimaryWide}
                      disabled={guardandoPrecio}
                      onClick={handleCrearPrecio}
                    >
                      {guardandoPrecio ? "Guardando..." : "Agregar Precio"}
                    </button>
                  </div>

                  <div className={styles.priceFormExtra}>
                    <input
                      className={styles.formControl}
                      placeholder="Modelo (ej: Corolla)"
                      value={formPrecio.modelo}
                      onChange={(e) => handleFormPrecioChange("modelo", e.target.value)}
                      aria-label="Modelo"
                    />
                    <input
                      className={styles.formControl}
                      type="number"
                      placeholder="Año desde"
                      value={formPrecio.anoDesde}
                      onChange={(e) => handleFormPrecioChange("anoDesde", e.target.value)}
                      aria-label="Año desde"
                    />
                    <input
                      className={styles.formControl}
                      type="number"
                      placeholder="Año hasta"
                      value={formPrecio.anoHasta}
                      onChange={(e) => handleFormPrecioChange("anoHasta", e.target.value)}
                      aria-label="Año hasta"
                    />
                    <select
                      className={styles.formControl}
                      value={formPrecio.moneda}
                      onChange={(e) => handleFormPrecioChange("moneda", e.target.value)}
                      aria-label="Moneda"
                    >
                      {MONEDA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className={styles.formControl}
                      type="number"
                      placeholder="Mano de obra ($)"
                      value={formPrecio.precioManoObra}
                      onChange={(e) => handleFormPrecioChange("precioManoObra", e.target.value)}
                      aria-label="Precio mano de obra"
                    />
                    <input
                      className={styles.formControl}
                      type="number"
                      placeholder="Pintura ($)"
                      value={formPrecio.precioPintura}
                      onChange={(e) => handleFormPrecioChange("precioPintura", e.target.value)}
                      aria-label="Precio pintura"
                    />
                  </div>
                </section>

                <section className={styles.card}>
                  {catalogoFiltrado.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>💲</span>
                      <p className={styles.emptyText}>
                        {catalogoPrecios.length === 0
                          ? "Todavía no hay precios asignados en el catálogo."
                          : "Ningún registro coincide con la búsqueda o los filtros."}
                      </p>
                    </div>
                  ) : (
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Pieza</th>
                            <th>Marca / Modelo</th>
                            <th>Años</th>
                            <th>Precio Repuesto</th>
                            <th>Mano de obra</th>
                            <th>Pintura</th>
                            <th className={styles.thRight}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catalogoFiltrado.map((precio) => (
                            <tr key={precio.id}>
                              <td className={styles.cellStrong}>{precio.pieza_nombre}</td>
                              <td className={styles.cellText}>
                                {precio.marca} {precio.modelo}
                              </td>
                              <td className={styles.cellText}>
                                {precio.ano_desde}–{precio.ano_hasta}
                              </td>
                              <td className={styles.cellPrice}>
                                {formatMoneda(precio.precio_repuesto, precio.moneda)}
                              </td>
                              <td className={styles.cellText}>
                                {formatMoneda(precio.precio_mano_obra, precio.moneda)}
                              </td>
                              <td className={styles.cellText}>
                                {formatMoneda(precio.precio_pintura, precio.moneda)}
                              </td>
                              <td>
                                <div className={styles.tableActions}>
                                  <button
                                    type="button"
                                    className={styles.btnRed}
                                    disabled={eliminandoPrecioId === precio.id}
                                    onClick={() => handleEliminarPrecio(precio)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>

      {notifAbiertas && (
        <NotificationsModal pendientes={talleresPendientes} onClose={cerrarNotificaciones} />
      )}
    </div>
  );
};

export default AdminDashboardPage;
