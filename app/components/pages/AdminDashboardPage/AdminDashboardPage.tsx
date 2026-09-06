"use client";

import { useState, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Button from "../../ui/Button/Button";
import Info from "../../ui/Info/Info";
import Select from "../../ui/Select/Select";
import Input from "../../ui/Input/Input";
import Pill from "../../ui/Pill/Pill";
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

const truncarId = (id: string) =>
  id && id.length > 10 ? `${id.slice(0, 10)}...` : id ?? "-";

const rolePillClass = (rol: string) => {
  const variantes: Record<string, string> = {
    cliente: styles.rolePillCliente,
    taller: styles.rolePillTaller,
    admin: styles.rolePillAdmin,
  };
  return `${styles.rolePill} ${variantes[rol] ?? ""}`;
};

const formatMoneda = (valor: number | null, moneda: string) =>
  valor === null || valor === undefined
    ? "—"
    : `${new Intl.NumberFormat("es-CO").format(valor)} ${moneda}`;

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

interface CollapsibleSectionProps {
  titulo: string;
  abierta: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const CollapsibleSection = ({ titulo, abierta, onToggle, children }: CollapsibleSectionProps) => (
  <section className={styles.tableSection}>
    <div
      className={styles.sectionHeader}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle();
      }}
    >
      <h2 className={styles.sectionTitle}>{titulo}</h2>
      {abierta ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
    </div>
    {abierta && <div className={styles.sectionBody}>{children}</div>}
  </section>
);

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
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [busquedaTaller, setBusquedaTaller] = useState("");
  const [busquedaCatalogo, setBusquedaCatalogo] = useState("");
  const [formPrecio, setFormPrecio] = useState(FORM_PRECIO_INICIAL);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [eliminandoPrecioId, setEliminandoPrecioId] = useState<number | null>(null);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    talleres: false,
    usuarios: false,
    catalogo: false,
  });

  const toggleSeccion = (seccion: keyof typeof seccionesAbiertas) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const [resumenData, talleresData, usuariosData, piezasData, catalogoData] =
        await Promise.all([
          adminService.getResumen(),
          adminService.getTalleres(),
          adminService.getUsuarios(),
          adminService.getPiezas(),
          adminService.getCatalogoPrecios(),
        ]);
      setResumen(resumenData);
      setTalleres(talleresData);
      setUsuarios(usuariosData);
      setPiezas(piezasData);
      setCatalogoPrecios(catalogoData);
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES.LOAD_ERROR);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
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

  const talleresFiltrados = [...talleres]
    .filter((t) => t.nombre.toLowerCase().includes(busquedaTaller.trim().toLowerCase()))
    .sort((a, b) => Number(a.verificado) - Number(b.verificado));

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_completo.toLowerCase().includes(busquedaUsuario.trim().toLowerCase())
  );

  const catalogoFiltrado = catalogoPrecios.filter((precio) => {
  const texto = busquedaCatalogo.trim().toLowerCase();
  if (!texto) return true;
  return (
    (precio.pieza_nombre ?? "").toLowerCase().includes(texto) ||
    (precio.marca ?? "").toLowerCase().includes(texto) ||
    (precio.modelo ?? "").toLowerCase().includes(texto) ||
    (precio.moneda ?? "").toLowerCase().includes(texto) ||
    String(precio.ano_desde ?? "").includes(texto) ||
    String(precio.ano_hasta ?? "").includes(texto)
  );
});

  const piezaOptions = [
    { value: "", label: "Selecciona una pieza" },
    ...piezas.map((p) => ({
      value: String(p.id),
      label: p.codigo ? `${p.nombre} (${p.codigo})` : p.nombre,
    })),
  ];

  return (
    <main className={styles.main}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Panel de Administración Global</h1>
          <p className={styles.subtitle}>
            Supervisión del sistema, verificación de talleres y gestión de usuarios
          </p>
        </div>
        <span className={styles.roleBadge}>ROL: ADMIN</span>
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
              <div className={`${styles.kpiIconBox} ${styles.kpiIconWarning}`}>🏪</div>
              <div className={styles.kpiNumber}>
                {resumen?.talleres_pendientes ?? 0}
              </div>
              <div className={styles.kpiLabel}>Talleres Pendientes</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIconBox} ${styles.kpiIconInfo}`}>👤</div>
              <div className={styles.kpiNumber}>{resumen?.total_usuarios ?? 0}</div>
              <div className={styles.kpiLabel}>Usuarios Totales</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIconBox} ${styles.kpiIconSuccess}`}>🚙</div>
              <div className={styles.kpiNumber}>{resumen?.total_vehiculos ?? 0}</div>
              <div className={styles.kpiLabel}>Vehículos Registrados</div>
            </div>
          </section>

          <CollapsibleSection
            titulo="Gestión de Talleres (todos los estados)"
            abierta={seccionesAbiertas.talleres}
            onToggle={() => toggleSeccion("talleres")}
          >
            <Input
              placeholder="Buscar por nombre de taller..."
              value={busquedaTaller}
              onChange={setBusquedaTaller}
              className={styles.searchInput}
            />

            {talleresFiltrados.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🏪</span>
                <p className={styles.emptyText}>
                  {talleres.length === 0
                    ? "Aún no hay talleres registrados."
                    : `Ningún taller coincide con "${busquedaTaller}".`}
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nombre Taller</th>
                      <th>Categoría</th>
                      <th>Propietario ID</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talleresFiltrados.map((taller) => (
                      <tr key={taller.id}>
                        <td className={styles.cellStrong}>{taller.nombre}</td>
                        <td>{taller.categoria}</td>
                        <td className={styles.cellMuted}>{truncarId(taller.propietario_id)}</td>
                        <td>
                          <Pill color={taller.verificado ? "success" : "warning"}>
                            {taller.verificado ? "Aprobado" : "Pendiente"}
                          </Pill>
                        </td>
                        <td>
                          {taller.verificado ? (
                            <Button
                              color="orange"
                              disabled={actualizandoTallerId === taller.id}
                              onClick={() => handleRevocarTaller(taller)}
                            >
                              Revocar aprobación
                            </Button>
                          ) : (
                            <div className={styles.tableActions}>
                              <Button
                                color="green"
                                disabled={actualizandoTallerId === taller.id}
                                onClick={() => handleVerificarTaller(taller.id, true)}
                              >
                                Aprobar
                              </Button>
                              <Button
                                color="red"
                                disabled={actualizandoTallerId === taller.id}
                                onClick={() => handleVerificarTaller(taller.id, false)}
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            titulo="Gestión de Usuarios y Asignación de Roles"
            abierta={seccionesAbiertas.usuarios}
            onToggle={() => toggleSeccion("usuarios")}
          >
            <Input
              placeholder="Buscar por nombre de usuario..."
              value={busquedaUsuario}
              onChange={setBusquedaUsuario}
              className={styles.searchInput}
            />

            {usuariosFiltrados.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyText}>
                  Ningún usuario coincide con "{busquedaUsuario}".
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
                      <th>Cambiar Rol</th>
                      <th>Estado</th>
                      <th>Cuenta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id}>
                        <td className={styles.cellStrong}>{usuario.nombre_completo}</td>
                        <td className={styles.cellMuted}>{usuario.correo}</td>
                        <td>
                          <span className={rolePillClass(usuario.rol)}>{usuario.rol}</span>
                        </td>
                        <td>
                          <Select
                            options={ROLE_OPTIONS}
                            value={rolSeleccionado[usuario.id] ?? usuario.rol}
                            disabled={cambiandoRolId === usuario.id}
                            onChange={(valor) => handleSelectChange(usuario, valor)}
                          />
                        </td>
                        <td>
                          <Pill color={usuario.activo ? "success" : "error"}>
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </Pill>
                        </td>
                        <td>
                          <Button
                            color={usuario.activo ? "red" : "green"}
                            disabled={cambiandoEstadoId === usuario.id}
                            onClick={() => handleToggleEstado(usuario)}
                          >
                            {usuario.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            titulo="Gestión del Catálogo de Precios"
            abierta={seccionesAbiertas.catalogo}
            onToggle={() => toggleSeccion("catalogo")}
          >
            <p className={styles.sectionHint}>
              Asigna un precio de repuesto, mano de obra y pintura a una pieza para un rango de marca, modelo y año.
            </p>

            <div className={styles.priceForm}>
              <div className={styles.priceFormGrid}>
                <div className={styles.priceFormField}>
                  <label>Pieza</label>
                  <Select
                    options={piezaOptions}
                    value={formPrecio.piezaId}
                    onChange={(v) => handleFormPrecioChange("piezaId", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Marca</label>
                  <Input
                    placeholder="Ej. Toyota"
                    value={formPrecio.marca}
                    onChange={(v) => handleFormPrecioChange("marca", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Modelo</label>
                  <Input
                    placeholder="Ej. Corolla"
                    value={formPrecio.modelo}
                    onChange={(v) => handleFormPrecioChange("modelo", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Año desde</label>
                  <Input
                    type="number"
                    placeholder="2015"
                    value={formPrecio.anoDesde}
                    onChange={(v) => handleFormPrecioChange("anoDesde", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Año hasta</label>
                  <Input
                    type="number"
                    placeholder="2023"
                    value={formPrecio.anoHasta}
                    onChange={(v) => handleFormPrecioChange("anoHasta", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Moneda</label>
                  <Select
                    options={MONEDA_OPTIONS}
                    value={formPrecio.moneda}
                    onChange={(v) => handleFormPrecioChange("moneda", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Precio repuesto</label>
                  <Input
                    type="number"
                    placeholder="350000"
                    value={formPrecio.precioRepuesto}
                    onChange={(v) => handleFormPrecioChange("precioRepuesto", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Precio mano de obra</label>
                  <Input
                    type="number"
                    placeholder="80000"
                    value={formPrecio.precioManoObra}
                    onChange={(v) => handleFormPrecioChange("precioManoObra", v)}
                  />
                </div>
                <div className={styles.priceFormField}>
                  <label>Precio pintura</label>
                  <Input
                    type="number"
                    placeholder="120000"
                    value={formPrecio.precioPintura}
                    onChange={(v) => handleFormPrecioChange("precioPintura", v)}
                  />
                </div>
              </div>

              <Button color="green" disabled={guardandoPrecio} onClick={handleCrearPrecio}>
                {guardandoPrecio ? "Guardando..." : "Agregar precio"}
              </Button>
            </div>

            <Input
              placeholder="Buscar por pieza, marca, modelo, moneda o año..."
              value={busquedaCatalogo}
              onChange={setBusquedaCatalogo}
              className={styles.searchInput}
            />

            {catalogoFiltrado.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>💲</span>
                <p className={styles.emptyText}>
                  {catalogoPrecios.length === 0
                    ? "Todavía no hay precios asignados en el catálogo."
                    : `Ningún registro coincide con "${busquedaCatalogo}".`}
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
                      <th>Repuesto</th>
                      <th>Mano de obra</th>
                      <th>Pintura</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogoFiltrado.map((precio) => (
                      <tr key={precio.id}>
                        <td className={styles.cellStrong}>{precio.pieza_nombre}</td>
                        <td>
                          {precio.marca} {precio.modelo}
                        </td>
                        <td className={styles.cellMuted}>
                          {precio.ano_desde}–{precio.ano_hasta}
                        </td>
                        <td>{formatMoneda(precio.precio_repuesto, precio.moneda)}</td>
                        <td>{formatMoneda(precio.precio_mano_obra, precio.moneda)}</td>
                        <td>{formatMoneda(precio.precio_pintura, precio.moneda)}</td>
                        <td>
                          <Button
                            color="red"
                            disabled={eliminandoPrecioId === precio.id}
                            onClick={() => handleEliminarPrecio(precio)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>
        </>
      )}
    </main>
  );
};

export default AdminDashboardPage;