"use client";

import { useEffect, useState } from "react";
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
} from "./AdminDashboard.service";
import { ERROR_MESSAGES, ROLE_OPTIONS } from "./AdminDashboard.constants";

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

const AdminDashboardPage = () => {
  const [resumen, setResumen] = useState<ResumenAdmin | null>(null);
  const [talleres, setTalleres] = useState<TallerAdmin[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizandoTallerId, setActualizandoTallerId] = useState<number | null>(null);
  const [cambiandoRolId, setCambiandoRolId] = useState<number | null>(null);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<Record<number, string>>({});
  const [busqueda, setBusqueda] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const [resumenData, talleresData, usuariosData] = await Promise.all([
        adminService.getResumen(),
        adminService.getTalleres(),
        adminService.getUsuarios(),
      ]);
      setResumen(resumenData);
      setTalleres(talleresData);
      setUsuarios(usuariosData);
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

  // Pendientes primero, para que salten a la vista
  const talleresOrdenados = [...talleres].sort(
    (a, b) => Number(a.verificado) - Number(b.verificado)
  );
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_completo.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

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
              <div className={`${styles.kpiNumber} ${styles.kpiNumberWarning}`}>
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

          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>Gestión de Talleres (todos los estados)</h2>

            {talleresOrdenados.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🏪</span>
                <p className={styles.emptyText}>Aún no hay talleres registrados.</p>
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
                    {talleresOrdenados.map((taller) => (
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
          </section>

          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>Gestión de Usuarios y Asignación de Roles</h2>

            <Input
              placeholder="Buscar por nombre de usuario..."
              value={busqueda}
              onChange={setBusqueda}
              className={styles.searchInput}
            />

            {usuariosFiltrados.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyText}>
                  Ningún usuario coincide con "{busqueda}".
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
          </section>
        </>
      )}
    </main>
  );
};

export default AdminDashboardPage;