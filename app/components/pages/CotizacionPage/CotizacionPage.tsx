"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CotizacionPage.module.css";
import Button from "@/app/components/ui/Button/Button";
import { authenticatedFetch, readApiError } from "@/app/lib/api/client";
import { getAuthenticatedVehicles, type Vehicle } from "@/app/lib/api/vehicles";
import AnalisisFoto from "./AnalisisFoto/AnalisisFoto";
import CostoEstimado from "./AnalisisFoto/CostoEstimado";
import DanosDetectados from "./AnalisisFoto/DanosDetectados";
import { ETIQUETA_COTIZACION, type Establecimiento } from "./AnalisisFoto/AnalisisFoto.constants";
import type { ResultadoAnalisis } from "./AnalisisFoto/AnalisisFoto.service";
import { useEstimacion } from "./AnalisisFoto/useEstimacion";
import { generarPDF } from "./Cotizacion.pdf";
import { construirObservaciones, montoMedio, nombreEstablecimiento } from "./Cotizacion.utils";

// Configuración de etiquetas: label (visual), emoji (interfaz), valor (base de datos)
const ETIQUETAS_DANOS = [
  { label: "Rayón", emoji: "🖍️", valor: "Rayon" },
  { label: "Abolladura", emoji: "🔨", valor: "Abolladura" },
  { label: "Rotura", emoji: "💥", valor: "Rotura" },
  { label: "Pintura", emoji: "🎨", valor: "Pintura" },
  { label: "Falta pieza", emoji: "🔍", valor: "Falta pieza" },
];

interface Pieza {
  id: number;
  nombre: string;
  precio_repuesto: number | null;
  precio_mano_obra: number | null;
  precio_pintura: number | null;
  moneda: string | null;
}

interface ItemSeleccionado {
  pieza_id: number;
  nombre: string;
  cantidad: number;
  descripcion: string;
}

interface PiezasEstado {
  vehiculoId: number;
  piezas: Pieza[];
  error: string | null;
}

export default function CotizacionPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "Selected">("Selected");
  const [observaciones, setObservaciones] = useState("");
  const [fechaIncidente, setFechaIncidente] = useState(new Date().toISOString().split("T")[0]);

  const [items, setItems] = useState<ItemSeleccionado[]>([]);
  const [piezasEstado, setPiezasEstado] = useState<PiezasEstado | null>(null);
  const [loading, setLoading] = useState(false);

  // Resultado de la foto y pieza asignada a cada daño (por índice)
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [asignaciones, setAsignaciones] = useState<Record<number, string>>({});
  const [establecimiento, setEstablecimiento] = useState<Establecimiento>("multimarca");

  const vehiculoId = typeof selectedVehicleId === "number" ? selectedVehicleId : null;
  const danos = useMemo(() => resultado?.danos_detectados ?? [], [resultado]);
  const estimacion = useEstimacion(vehiculoId, danos, asignaciones);

  // Los datos del siniestro habilitan el detalle de piezas
  const datosListos = vehiculoId !== null && Boolean(fechaIncidente);

  // 1. Cargar vehículos
  useEffect(() => {
    let activo = true;
    getAuthenticatedVehicles()
      .then((data: Vehicle[]) => {
        if (activo) setVehicles(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (activo) console.error("Error cargando vehículos:", err);
      });
    return () => {
      activo = false;
    };
  }, []);

  // 2. Cargar piezas del vehículo elegido
  useEffect(() => {
    if (vehiculoId === null) return;
    let activo = true;
    authenticatedFetch(`/api/v1/vehiculos/${vehiculoId}/piezas-disponibles`)
      .then(async (res) => {
        if (!res.ok) throw await readApiError(res, "No se pudieron cargar las piezas disponibles.");
        return res.json();
      })
      .then((data: Pieza[]) => {
        if (activo) {
          setPiezasEstado({ vehiculoId, piezas: Array.isArray(data) ? data : [], error: null });
        }
      })
      .catch((err: unknown) => {
        console.error("Error cargando piezas:", err);
        if (activo) {
          setPiezasEstado({
            vehiculoId,
            piezas: [],
            error: err instanceof Error ? err.message : "No se pudieron cargar las piezas disponibles.",
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [vehiculoId]);

  const piezasVigentes = vehiculoId !== null && piezasEstado?.vehiculoId === vehiculoId ? piezasEstado : null;
  const piezasDisponibles = piezasVigentes?.piezas ?? [];
  const cargandoPiezas = vehiculoId !== null && !piezasVigentes;

  // Etiquetas de daño sugeridas por la foto (solo se marcan, no se activan solas)
  const etiquetasSugeridas = useMemo(() => {
    const etiquetas = danos
      .map((dano) => ETIQUETA_COTIZACION[dano.tipo_dano])
      .filter((etiqueta): etiqueta is string => Boolean(etiqueta));
    return [...new Set(etiquetas)];
  }, [danos]);

  const alAnalizar = (nuevo: ResultadoAnalisis | null) => {
    setResultado(nuevo);
    setAsignaciones({});
  };

  const asignarPieza = (indice: number, pieza: string) => {
    setAsignaciones((actual) => ({ ...actual, [indice]: pieza }));
  };

  const agregarPieza = (piezaId: string) => {
    if (!piezaId) return;
    const pieza = piezasDisponibles.find((p) => p.id === parseInt(piezaId));
    if (pieza) {
      setItems((actual) => [
        ...actual,
        { pieza_id: pieza.id, nombre: pieza.nombre, cantidad: 1, descripcion: "" },
      ]);
    }
  };

  const eliminarItem = (index: number) => {
    setItems((actual) => actual.filter((_, i) => i !== index));
  };

  const cambiarDescripcion = (index: number, descripcion: string) => {
    setItems((actual) => actual.map((item, i) => (i === index ? { ...item, descripcion } : item)));
  };

  const toggleEtiqueta = (index: number, valorEtiqueta: string) => {
    setItems((actual) =>
      actual.map((item, i) => {
        if (i !== index) return item;
        const activas = item.descripcion ? item.descripcion.split(", ").filter((t) => t.trim() !== "") : [];
        const nuevas = activas.includes(valorEtiqueta)
          ? activas.filter((t) => t !== valorEtiqueta)
          : [...activas, valorEtiqueta];
        return { ...item, descripcion: nuevas.join(", ") };
      }),
    );
  };

  // Mensaje guía del cuadro de costo cuando todavía no hay estimado
  let guia: string | null = null;
  if (danos.length === 0) {
    guia = "Sube una foto y analiza los daños para ver el costo estimado.";
  } else if (vehiculoId === null) {
    guia = "Elige tu vehículo en «Datos del siniestro» para calcular el costo.";
  } else if (!estimacion.listo) {
    guia = "Asigna la pieza afectada a cada daño para calcular el costo.";
  }

  const monto = montoMedio(estimacion.estimacion, establecimiento);
  const puedeFinalizar = datosListos && (items.length > 0 || monto !== null);

  const enviarCotizacion = async () => {
    const vehiculoActual = vehicles.find((v) => v.id === selectedVehicleId);
    if (!vehiculoActual || !puedeFinalizar) return;

    setLoading(true);
    const payload = {
      vehiculo_id: vehiculoActual.id,
      fecha_incidente: fechaIncidente,
      observaciones: construirObservaciones({
        notas: observaciones,
        danos,
        asignaciones,
        estimacion: estimacion.estimacion,
        establecimiento,
      }),
      items: items.map((i) => ({
        pieza_id: i.pieza_id,
        cantidad: i.cantidad,
        descripcion: i.descripcion || "Sin descripción específica",
      })),
      monto_estimado: monto ?? undefined,
    };

    try {
      const response = await authenticatedFetch("/api/v1/cotizaciones/completa", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        generarPDF({
          vehiculo: vehiculoActual,
          fecha: fechaIncidente,
          estimacion: estimacion.estimacion,
          filas: items.map((item) => {
            const info = piezasDisponibles.find((p) => p.id === item.pieza_id);
            return {
              nombre: item.nombre,
              detalle: item.descripcion,
              repuesto: info?.precio_repuesto ?? 0,
              manoObra: info?.precio_mano_obra ?? 0,
              pintura: info?.precio_pintura ?? 0,
              cantidad: item.cantidad,
            };
          }),
        });
        alert("✅ Cotización guardada y PDF generado. La verás en tu historial.");
        router.push("/historial");
      } else {
        const apiError = await readApiError(
          response,
          response.status === 404
            ? "El vehículo no existe o no pertenece al usuario actual."
            : response.status === 422
              ? "Revisa los datos de la cotización."
              : "Error al procesar la cotización en el servidor",
        );
        alert(`❌ ${apiError.message}`);
      }
    } catch (error) {
      console.error("Error conexión API:", error);
      alert("❌ Error crítico: No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Cotización con foto</h1>
        <p>Sube una foto del daño y obtén un rango aproximado de reparación en pocos segundos.</p>
      </header>

      <div className={styles.pantalla}>
        <div className={styles.areaCosto}>
          <CostoEstimado
            establecimiento={establecimiento}
            onCambiar={setEstablecimiento}
            estimacion={estimacion.estimacion}
            estimando={estimacion.estimando}
            error={estimacion.error}
            guia={guia}
          />
        </div>

        <div className={styles.areaFoto}>
          <AnalisisFoto onResultado={alAnalizar} />
        </div>

        <div className={styles.areaDanos}>
          <DanosDetectados danos={danos} asignaciones={asignaciones} onAsignar={asignarPieza} />
        </div>

        {/* DATOS DEL SINIESTRO */}
        <section className={`${styles.stepCard} ${styles.areaDatos}`}>
          <h2 className={styles.stepTitle}>Datos del siniestro</h2>

          <div className={styles.formGroup}>
            <label htmlFor="vehiculo">Vehículo</label>
            <select
              id="vehiculo"
              className={styles.select}
              value={selectedVehicleId}
              onChange={(e) =>
                setSelectedVehicleId(e.target.value === "Selected" ? "Selected" : parseInt(e.target.value))
              }
            >
              <option value="Selected">-- Selecciona tu auto --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fecha">Fecha del evento</label>
            <input
              id="fecha"
              type="date"
              className={styles.input}
              value={fechaIncidente}
              onChange={(e) => setFechaIncidente(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notas">Notas generales</label>
            <textarea
              id="notas"
              className={styles.textarea}
              placeholder="Ej: El golpe fue lateral..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </section>

        {/* DETALLE DE PIEZAS: se habilita al completar los datos del siniestro */}
        <section className={`${styles.stepCard} ${styles.areaPiezas}`}>
          <h2 className={styles.stepTitle}>Detalle de piezas</h2>

          {!datosListos && (
            <p className={styles.aviso}>
              Elige el vehículo y la fecha en «Datos del siniestro» para habilitar esta sección.
            </p>
          )}

          <fieldset className={styles.fieldset} disabled={!datosListos}>
            <div className={styles.formGroup}>
              <label htmlFor="pieza">Buscar pieza</label>
              <select
                id="pieza"
                className={styles.select}
                disabled={!datosListos || cargandoPiezas || piezasDisponibles.length === 0}
                onChange={(e) => {
                  agregarPieza(e.target.value);
                  e.target.value = "";
                }}
                value=""
              >
                <option value="">
                  {cargandoPiezas
                    ? "Cargando piezas..."
                    : datosListos && piezasDisponibles.length === 0
                      ? "No hay piezas disponibles"
                      : "-- Añadir pieza afectada --"}
                </option>
                {piezasDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {piezasVigentes?.error && <p className={styles.errorTexto}>{piezasVigentes.error}</p>}
            </div>

            <div className={styles.listContainer}>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>
                    {datosListos
                      ? "Las piezas son opcionales: puedes añadirlas o finalizar solo con el estimado de la foto."
                      : "Aún no hay piezas."}
                  </p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.pieza_id}-${index}`} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <strong>⚙️ {item.nombre}</strong>
                      <button type="button" onClick={() => eliminarItem(index)} className={styles.btnDelete}>
                        Remover
                      </button>
                    </div>

                    <div className={styles.tagSection}>
                      <p className={styles.smallLabel}>Daños identificados:</p>
                      <div className={styles.tagsGrid}>
                        {ETIQUETAS_DANOS.map((tag) => (
                          <button
                            key={tag.valor}
                            type="button"
                            className={`${styles.tagButton} ${item.descripcion.includes(tag.valor) ? styles.tagActive : ""} ${etiquetasSugeridas.includes(tag.valor) ? styles.tagSugerida : ""}`}
                            title={etiquetasSugeridas.includes(tag.valor) ? "Detectado en la foto" : undefined}
                            onClick={() => toggleEtiqueta(index, tag.valor)}
                          >
                            {etiquetasSugeridas.includes(tag.valor) && "✨ "}
                            {tag.emoji} {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Escribir más detalles..."
                      value={item.descripcion}
                      onChange={(e) => cambiarDescripcion(index, e.target.value)}
                      className={styles.input}
                    />
                  </div>
                ))
              )}
            </div>
          </fieldset>
        </section>
      </div>

      <footer className={styles.actions}>
        {monto !== null && (
          <p className={styles.notaGuardado}>
            Se guardará el valor medio del estimado {nombreEstablecimiento(establecimiento)}.
          </p>
        )}
        <Button color="green" onClick={enviarCotizacion} disabled={loading || !puedeFinalizar}>
          {loading ? "Enviando..." : "Finalizar Cotización"}
        </Button>
      </footer>
    </div>
  );
}
