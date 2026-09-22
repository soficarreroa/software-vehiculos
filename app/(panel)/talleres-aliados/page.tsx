"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import WorkshopCard from "../../components/pages/TalleresAliadosPage/WorkshopCard";
import SearchBar from "../../components/pages/TalleresAliadosPage/SearchBar";
import GeoEstado from "../../components/pages/TalleresAliadosPage/GeoEstado";
import { useEstadoConexion } from "../../components/pages/TalleresAliadosPage/useEstadoConexion";
import { useUbicacionEnVivo } from "../../components/pages/TalleresAliadosPage/useUbicacionEnVivo";
import {
  talleresCercanosService,
  GeoError,
} from "../../components/pages/TalleresAliadosPage/TalleresAliados.service";
import {
  CausaError,
  ClaveMensaje,
  EstadoGeo,
  MENSAJES_ESTADO,
  TEXTO_BANNER_OFFLINE,
  TEXTO_BOTON_CERCANOS,
  TEXTO_BOTON_CERCANOS_CARGANDO,
  TEXTO_BOTON_UBICACION_APAGAR,
  TEXTO_BOTON_UBICACION_ENCENDER,
  TEXTO_BOTON_VOLVER,
  TEXTO_CARGANDO_TALLERES,
} from "../../components/pages/TalleresAliadosPage/TalleresAliados.constants";
import Info from "../../components/ui/Info/Info";
import { Workshop } from "../../types/workshop";
import styles from "../../components/pages/TalleresAliadosPage/talleresaliados.module.css";
import RoleGate from "@/app/lib/auth/RoleGate";
import { authenticatedFetch, readApiError } from "@/app/lib/api/client";

const WorkshopMap = dynamic(
  () => import("../../components/pages/TalleresAliadosPage/WorkshopMap"),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Cargando mapa...</div>,
  }
);

export default function Page() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [geoMode, setGeoMode] = useState<"idle" | "nearby">("idle");
  const [nearbyWorkshops, setNearbyWorkshops] = useState<Workshop[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [marcas, setMarcas] = useState<{ value: string; label: string }[]>([
    { value: "all", label: "Marcas" },
  ]);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    categoria: "Mecánica general",
    marcas_soportadas: "",
    certificado: false,
  });

  // --- Casos límite ---------------------------------------------------
  const [estadoGeo, setEstadoGeo] = useState<EstadoGeo>({ tipo: "inactivo" });
  const [errorCarga, setErrorCarga] = useState<CausaError | null>(null);
  const [recargas, setRecargas] = useState(0);
  const enLinea = useEstadoConexion();
  const geoCargando = estadoGeo.tipo === "cargando";
  const {
    posicion: posicionEnVivo,
    activo: ubicacionEnVivoActiva,
    causaError: errorUbicacionEnVivo,
    alternar: alternarUbicacionEnVivo,
  } = useUbicacionEnVivo();
  // --------------------------------------------------------------------

  // Esta carga de talleres es IGUAL para los tres roles. No depende del usuario.
  useEffect(() => {
    let cancelado = false;

    async function cargarTalleres() {
      try {
        const res = await authenticatedFetch("/api/v1/talleres");
        if (!res.ok) throw await readApiError(res, "No se pudieron cargar los talleres.");
        const data = await res.json();
        if (cancelado) return;
        setWorkshops(Array.isArray(data) ? data : []);
        setErrorCarga(null);
      } catch (error) {
        console.error("Error al cargar talleres:", error);
        if (cancelado) return;
        // Sin red del navegador = offline; con red = la API no respondió.
        setErrorCarga(navigator.onLine === false ? "sin-conexion" : "servidor");
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargarTalleres();
    return () => {
      cancelado = true;
    };
  }, [recargas]);

  /** Reintento manual desde el estado de error. */
  const reintentarCarga = () => {
    setLoading(true);
    setErrorCarga(null);
    setRecargas((n) => n + 1);
  };

  // Si la carga falló por falta de red, se reintenta sola en cuanto vuelve.
  useEffect(() => {
    if (errorCarga !== "sin-conexion") return;
    const alRecuperarRed = () => setRecargas((n) => n + 1);
    window.addEventListener("online", alRecuperarRed);
    return () => window.removeEventListener("online", alRecuperarRed);
  }, [errorCarga]);

  useEffect(() => {
    async function fetchMarcas() {
      try {
        const res = await authenticatedFetch("/api/v1/marcas");
        if (!res.ok) throw await readApiError(res, "No se pudieron cargar las marcas.");
        const data: string[] = await res.json();
        const vistos = new Set<string>();
        const opciones = [{ value: "all", label: "Marcas" }];
        for (const marca of data) {
          const valor = marca.toLowerCase();
          if (vistos.has(valor)) continue;
          vistos.add(valor);
          opciones.push({ value: valor, label: marca });
        }

        setMarcas(opciones);
      } catch (error) {
        // El filtro de marcas es secundario: si falla, la página sigue
        // funcionando con la opción "Marcas" por defecto.
        console.error("Error al cargar marcas:", error);
      }
    }
    fetchMarcas();
  }, []);

  const baseWorkshops = geoMode === "nearby" ? nearbyWorkshops : workshops;

  const filteredWorkshops = baseWorkshops.filter((workshop) => {
    if (!workshop.nombre || !workshop.direccion || !workshop.categoria) return false;

    const matchesSearch =
      workshop.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
      workshop.direccion.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter =
      filterValue === "all" ||
      (workshop.marcas_soportadas &&
        workshop.marcas_soportadas.some(
          (m: string) => m.toLowerCase() === filterValue.toLowerCase()
        ));

    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authenticatedFetch("/api/v1/talleres", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          marcas_soportadas: formData.marcas_soportadas.split(",").map((m) => m.trim()),
          rating: 0,
          reviews: 0,
        }),
      });
      if (!res.ok) throw await readApiError(res, "No se pudo crear el taller.");
      const nuevoTaller = await res.json();
      setWorkshops((prev) => [...prev, nuevoTaller]);
      setShowForm(false);
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        categoria: "Mecánica general",
        marcas_soportadas: "",
        certificado: false,
      });
    } catch (error) {
      console.error("Error al crear taller:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuscarCercanos = async () => {
    setEstadoGeo({ tipo: "cargando" });

    try {
      const { latitude, longitude } = await talleresCercanosService.obtenerUbicacion();
      const cercanos = await talleresCercanosService.buscarCercanos(latitude, longitude);

      setUserCoords({ lat: latitude, lng: longitude });
      setNearbyWorkshops(cercanos);
      setGeoMode("nearby");
      setEstadoGeo(
        cercanos.length === 0 ? { tipo: "sin-resultados" } : { tipo: "con-resultados" }
      );
    } catch (error) {
      const causa: CausaError = error instanceof GeoError ? error.causa : "desconocido";
      console.error("Talleres cercanos:", causa, error);

      // Se mantiene la vista normal: el usuario no pierde la lista
      // completa solo porque falló la parte de geolocalización.
      setNearbyWorkshops([]);
      setGeoMode("idle");
      setUserCoords(null);
      setEstadoGeo({ tipo: "error", causa });
    }
  };

  const handleVolverVistaNormal = () => {
    setGeoMode("idle");
    setNearbyWorkshops([]);
    setUserCoords(null);
    setEstadoGeo({ tipo: "inactivo" });
  };

  const handleLimpiarFiltros = () => {
    setSearchValue("");
    setFilterValue("all");
  };

  /**
   * Decide qué se muestra en la zona de resultados. Solo una cosa a la
   * vez, y siempre la más específica primero.
   */
  const claveEstado: ClaveMensaje | null = (() => {
    if (loading || geoCargando) return null;
    if (errorCarga) return errorCarga;
    if (estadoGeo.tipo === "error") return estadoGeo.causa;
    if (estadoGeo.tipo === "sin-resultados") return "sin-resultados";
    if (baseWorkshops.length === 0) return "sin-talleres";
    if (filteredWorkshops.length === 0) return "sin-coincidencias";
    return null;
  })();

  const accionEstado = (() => {
    if (claveEstado === "sin-coincidencias") return handleLimpiarFiltros;
    if (claveEstado === "sin-resultados") return handleVolverVistaNormal;
    if (errorCarga) return reintentarCarga;
    return handleBuscarCercanos;
  })();
  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>Red de Talleres Aliados</h1>
        <p className={styles.subtitle}>
          Encuentra centros de reparación certificados cerca de ti.
        </p>
      </div>

      {/* Caso B: aviso permanente mientras no haya red. */}
      {!enLinea && <Info severity="warning">{TEXTO_BANNER_OFFLINE}</Info>}

      {/* SOLO el botón depende del rol. Todo lo demás es igual para los tres. */}
      <RoleGate excludeRoles={["cliente"]}>
        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={() => setShowForm(true)}>
            + Agregar Taller
          </button>
        </div>
      </RoleGate>

      <div className={styles.nearbyRow}>
        <button
          className={styles.nearbyButton}
          onClick={handleBuscarCercanos}
          disabled={geoCargando || !enLinea}
          title={!enLinea ? "Necesitas conexión a internet para buscar talleres cercanos" : undefined}
        >
          {geoCargando ? TEXTO_BOTON_CERCANOS_CARGANDO : TEXTO_BOTON_CERCANOS}
        </button>
        {geoMode === "nearby" && (
          <button className={styles.nearbyBackButton} onClick={handleVolverVistaNormal}>
            {TEXTO_BOTON_VOLVER}
          </button>
        )}
      </div>

      <SearchBar
        onSearch={setSearchValue}
        onFilterChange={setFilterValue}
        options={marcas}
        searchValue={searchValue}
        filterValue={filterValue}
      />

      {loading || geoCargando ? (
        <p role="status" aria-live="polite">
          {geoCargando ? TEXTO_BOTON_CERCANOS_CARGANDO : TEXTO_CARGANDO_TALLERES}
        </p>
      ) : claveEstado ? (
        <GeoEstado clave={claveEstado} onAccion={accionEstado} />
      ) : (
        <div className={styles.workshopsLayout}>
          <div className={styles.listColumn}>
            <div className={styles.gridWorkshops}>
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  nombre={workshop.nombre}
                  category={workshop.categoria}
                  direccion={workshop.direccion}
                  rating={workshop.rating}
                  reviews={workshop.reviews}
                  distanciaKm={workshop.distancia_km}
                />
              ))}
            </div>
          </div>
          <div className={styles.mapColumn}>
            <div className={styles.mapOverlayWrapper}>
              <WorkshopMap
                workshops={filteredWorkshops}
                userCoords={userCoords}
                posicionEnVivo={posicionEnVivo}
              />
              <button
                type="button"
                className={`${styles.locateButton} ${
                  ubicacionEnVivoActiva ? styles.locateButtonActive : ""
                }`}
                onClick={alternarUbicacionEnVivo}
                aria-pressed={ubicacionEnVivoActiva}
                title={
                  ubicacionEnVivoActiva
                    ? TEXTO_BOTON_UBICACION_APAGAR
                    : TEXTO_BOTON_UBICACION_ENCENDER
                }
              >
                📍
              </button>
            </div>
            {errorUbicacionEnVivo && (
              <div className={styles.mapNotice}>
                <Info severity="warning">
                  {MENSAJES_ESTADO[errorUbicacionEnVivo as ClaveMensaje].texto}
                </Info>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.formTitle}>Agregar Nuevo Taller</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Dirección</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Teléfono</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Categoría</label>
                <select
                  className={styles.formSelect}
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="Mecánica general">Mecánica general</option>
                  <option value="Frenos">Frenos</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Carrocería">Carrocería</option>
                  <option value="Llantas">Llantas</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Marcas Soportadas (separadas por comas)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.marcas_soportadas}
                  onChange={(e) => setFormData({ ...formData, marcas_soportadas: e.target.value })}
                  placeholder="Toyota, Honda, Ford..."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="certificado"
                    className={styles.checkbox}
                    checked={formData.certificado}
                    onChange={(e) => setFormData({ ...formData, certificado: e.target.checked })}
                  />
                  <label htmlFor="certificado" className={styles.formLabel} style={{ marginBottom: 0 }}>
                    Certificado
                  </label>
                </div>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}