"use client";

import { useState, useEffect } from "react";
import WorkshopCard from "../../components/pages/TalleresAliadosPage/WorkshopCard";
import SearchBar from "../../components/pages/TalleresAliadosPage/SearchBar";
import { Workshop } from "../../types/workshop";
import styles from "../../components/pages/TalleresAliadosPage/talleresaliados.module.css";
import RoleGate from "@/app/lib/auth/RoleGate";
import { authenticatedFetch, readApiError, API_BASE_URL } from "@/app/lib/api/client";

export default function Page() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [geoMode, setGeoMode] = useState<"idle" | "nearby">("idle");
  const [nearbyWorkshops, setNearbyWorkshops] = useState<Workshop[]>([]);
  const [geoCargando, setGeoCargando] = useState(false);
  const [geoMensaje, setGeoMensaje] = useState("");
  const [marcas, setMarcas] = useState<{value: string, label: string}[]>([
    { value: "all", label: "Marcas" }
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

  // Esta carga de talleres es IGUAL para los tres roles. No depende del usuario.
  useEffect(() => {
    async function fetchTalleres() {
      try {
        const res = await authenticatedFetch("/api/v1/talleres");
        if (!res.ok) throw await readApiError(res, "No se pudieron cargar los talleres.");
        const data = await res.json();
        setWorkshops(data);
      } catch (error) {
        console.error("Error al cargar talleres:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTalleres();
  }, []);

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
      console.error("Error al cargar marcas:", error);
    }
  }
  fetchMarcas();
}, []);

  const filteredWorkshops = (geoMode === "nearby" ? nearbyWorkshops : workshops).filter((workshop) => {
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

  const handleBuscarCercanos = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoMensaje("Tu navegador no soporta esta función");
      return;
    }

    setGeoMensaje("");
    setGeoCargando(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/talleres/cercanos?lat=${latitude}&lng=${longitude}`
          );
          if (!res.ok) throw new Error("Error al obtener talleres cercanos.");
          const data: Workshop[] = await res.json();
          setNearbyWorkshops(data);
          setGeoMode("nearby");
        } catch (error) {
          console.error("Error al obtener talleres cercanos:", error);
          setGeoMensaje(
            "No pudimos acceder a tu ubicación. Puedes seguir buscando por nombre o ciudad."
          );
        } finally {
          setGeoCargando(false);
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error.code, error.message);
        setGeoCargando(false);
        setGeoMensaje(
          "No pudimos acceder a tu ubicación. Puedes seguir buscando por nombre o ciudad."
        );
      }
    );
  };

  const handleVolverVistaNormal = () => {
    setGeoMode("idle");
    setNearbyWorkshops([]);
    setGeoMensaje("");
  };

  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>Red de Talleres Aliados</h1>
        <p className={styles.subtitle}>
          Encuentra centros de reparación certificados cerca de ti.
        </p>
      </div>

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
          disabled={geoCargando}
        >
          {geoCargando ? "Obteniendo tu ubicación..." : "📍 Ver talleres cerca de mí"}
        </button>
        {geoMode === "nearby" && (
          <button className={styles.nearbyBackButton} onClick={handleVolverVistaNormal}>
            Volver a la vista normal
          </button>
        )}
      </div>
      {geoMensaje && <p className={styles.geoMessage}>{geoMensaje}</p>}

      <SearchBar onSearch={setSearchValue} onFilterChange={setFilterValue} options={marcas} />

      {loading ? (
        <p>Cargando talleres...</p>
      ) : (
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