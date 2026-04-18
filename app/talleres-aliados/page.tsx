"use client";

import { useState, useEffect } from "react";
import WorkshopCard from "../components/pages/TalleresAliadosPage/WorkshopCard";
import SearchBar from "../components/pages/TalleresAliadosPage/SearchBar";
import { Workshop } from "../types/workshop";
import styles from "../components/pages/TalleresAliadosPage/talleresaliados.module.css";

export default function Page() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    categoria: "Mecánica general",
    marcas_soportadas: "",
    certificado: false,
  });

  useEffect(() => {
    async function fetchTalleres() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/talleres`);
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

  const filteredWorkshops = workshops.filter((workshop) => {
    if (!workshop.nombre || !workshop.direccion || !workshop.categoria) return false;
    
    const matchesSearch =
      workshop.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
      workshop.direccion.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesFilter =
      filterValue === "all" ||
      workshop.categoria.toLowerCase().includes(filterValue);
    
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/talleres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          marcas_soportadas: formData.marcas_soportadas.split(",").map((m) => m.trim()),
          rating: 0,
          reviews: 0,
        }),
      });
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

  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>Red de Talleres Aliados</h1>
        <p className={styles.subtitle}>
          Encuentra centros de reparación certificados cerca de ti.
        </p>
      </div>

      <div className={styles.headerActions}>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Agregar Taller
        </button>
      </div>

      <SearchBar onSearch={setSearchValue} onFilterChange={setFilterValue} />

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
