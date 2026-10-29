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
import { type Establecimiento } from "./AnalisisFoto/AnalisisFoto.constants";
import type { ResultadoAnalisis } from "./AnalisisFoto/AnalisisFoto.service";
import { useEstimacion } from "./AnalisisFoto/useEstimacion";
import { generarPDF } from "./Cotizacion.pdf";
import { construirObservaciones, montoMedio, nombreEstablecimiento } from "./Cotizacion.utils";

interface ItemSeleccionado {
  pieza_id: number;
  nombre: string;
  cantidad: number;
  descripcion: string;
}

export default function CotizacionPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "Selected">("Selected");
  const [observaciones, setObservaciones] = useState("");
  const [fechaIncidente, setFechaIncidente] = useState(new Date().toISOString().split("T")[0]);

  const [items] = useState<ItemSeleccionado[]>([]);
  const [loading, setLoading] = useState(false);

  // Resultado de la foto y pieza asignada a cada daño (por índice)
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [asignaciones, setAsignaciones] = useState<Record<number, string>>({});
  const [establecimiento, setEstablecimiento] = useState<Establecimiento>("multimarca");

  const vehiculoId = typeof selectedVehicleId === "number" ? selectedVehicleId : null;
  const danos = useMemo(() => resultado?.danos_detectados ?? [], [resultado]);
  const estimacion = useEstimacion(vehiculoId, danos, asignaciones);

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

  const alAnalizar = (nuevo: ResultadoAnalisis | null) => {
    setResultado(nuevo);
    setAsignaciones({});
  };

  const asignarPieza = (indice: number, pieza: string) => {
    setAsignaciones((actual) => ({ ...actual, [indice]: pieza }));
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
          filas: items.map((item) => ({
            nombre: item.nombre,
            detalle: item.descripcion,
            repuesto: 0,
            manoObra: 0,
            pintura: 0,
            cantidad: item.cantidad,
          })),
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
          <AnalisisFoto onResultado={alAnalizar} marcaVehiculo={vehicles.find((v) => v.id === selectedVehicleId)?.marca ?? null} />
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
