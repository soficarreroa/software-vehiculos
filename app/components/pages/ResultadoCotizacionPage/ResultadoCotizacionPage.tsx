"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";
import Info from "@/app/components/ui/Info/Info";
import SelectorFoto from "@/app/components/ui/SelectorFoto/SelectorFoto";
import { analizarDanos, clasificarError, estimarCotizacion } from "@/app/lib/api/analisis";
import { getAuthenticatedVehicles, type Vehicle } from "@/app/lib/api/vehicles";
import type {
  AnalisisDanosResponse,
  ErrorResultado as ErrorResultadoTipo,
  EstimacionResponse,
  TipoEstablecimiento,
} from "@/app/types/cotizacionResultado";
import Advertencias from "./Advertencias";
import ErrorResultado from "./ErrorResultado";
import FotoAnalizada from "./FotoAnalizada";
import ListaDanos from "./ListaDanos";
import ResumenCosto from "./ResumenCosto";
import { ANALISIS_DEMO, ESTIMACION_DEMO, FOTO_DEMO } from "./ResultadoCotizacion.mock";
import styles from "./ResultadoCotizacion.module.css";

type Fase = "inicio" | "analizando" | "resultado" | "error";

const MODO_DESARROLLO = process.env.NODE_ENV !== "production";

export default function ResultadoCotizacionPage() {
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(true);
  const [errorVehiculos, setErrorVehiculos] = useState<string | null>(null);
  const [vehiculoId, setVehiculoId] = useState("");

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const [claveSelector, setClaveSelector] = useState(0);

  const [fase, setFase] = useState<Fase>("inicio");
  const [error, setError] = useState<ErrorResultadoTipo | null>(null);
  const [analisis, setAnalisis] = useState<AnalisisDanosResponse | null>(null);

  const [asignaciones, setAsignaciones] = useState<Record<number, string>>({});
  const [estimacion, setEstimacion] = useState<EstimacionResponse | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [errorEstimacion, setErrorEstimacion] = useState<string | null>(null);
  const [establecimiento, setEstablecimiento] = useState<TipoEstablecimiento>("multimarca");
  const [resaltado, setResaltado] = useState<number | null>(null);

  /* ----------------------------- Carga de vehículos ----------------------------- */
  useEffect(() => {
    let activo = true;
    getAuthenticatedVehicles()
      .then((lista) => {
        if (!activo) return;
        setVehiculos(lista);
        if (lista.length === 1) setVehiculoId(String(lista[0].id));
      })
      .catch((err: unknown) => {
        if (activo) {
          setErrorVehiculos(err instanceof Error ? err.message : "No se pudieron cargar tus vehículos.");
        }
      })
      .finally(() => {
        if (activo) setCargandoVehiculos(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  /* Libera la URL temporal de la foto al desmontar */
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  /* --------------------------------- Handlers --------------------------------- */
  const reemplazarUrl = (nueva: string | null) => {
    if (urlRef.current && urlRef.current.startsWith("blob:")) URL.revokeObjectURL(urlRef.current);
    urlRef.current = nueva;
    setFotoUrl(nueva);
  };

  const reiniciarResultados = () => {
    setAnalisis(null);
    setEstimacion(null);
    setAsignaciones({});
    setErrorEstimacion(null);
    setResaltado(null);
    setError(null);
  };

  const alSeleccionarFoto = (archivo: File | null) => {
    setFoto(archivo);
    reemplazarUrl(archivo ? URL.createObjectURL(archivo) : null);
    reiniciarResultados();
    setFase("inicio");
  };

  const nuevaFoto = () => {
    setFoto(null);
    reemplazarUrl(null);
    reiniciarResultados();
    setClaveSelector((n) => n + 1); // reinicia el SelectorFoto
    setFase("inicio");
  };

  const analizar = async () => {
    if (!foto) return;
    reiniciarResultados();
    setFase("analizando");
    try {
      const respuesta = await analizarDanos(foto);
      if (respuesta.danos_detectados.length === 0) {
        setError({
          tipo: "sin_danos",
          mensaje: respuesta.mensaje ?? "No se detectaron daños en la foto",
        });
        setFase("error");
        return;
      }
      setAnalisis(respuesta);
      setFase("resultado");
    } catch (err) {
      setError(clasificarError(err));
      setFase("error");
    }
  };

  const cargarDemo = () => {
    reiniciarResultados();
    reemplazarUrl(FOTO_DEMO);
    setAnalisis(ANALISIS_DEMO);
    setFase("resultado");
  };

  const asignarPieza = (indice: number, pieza: string) => {
    setAsignaciones((prev) => {
      const siguiente = { ...prev };
      if (pieza) siguiente[indice] = pieza;
      else delete siguiente[indice];
      return siguiente;
    });
    setEstimacion(null); // los totales dejan de ser válidos al cambiar piezas
    setErrorEstimacion(null);
  };

  const asignados = Object.keys(asignaciones).length;
  const esDemo = fotoUrl === FOTO_DEMO;

  const calcular = async () => {
    if (!analisis || asignados === 0) return;

    if (esDemo) {
      setEstimacion(ESTIMACION_DEMO);
      return;
    }
    if (!vehiculoId) {
      setErrorEstimacion("Selecciona el vehículo para calcular el estimado.");
      return;
    }

    setCalculando(true);
    setErrorEstimacion(null);
    try {
      const respuesta = await estimarCotizacion({
        vehiculo_id: Number(vehiculoId),
        danos: analisis.danos_detectados.map((d) => ({
          tipo_dano: d.tipo_dano,
          severidad: d.severidad,
          confianza: d.confianza,
        })),
        asignaciones: Object.entries(asignaciones).map(([indice, pieza]) => ({
          indice_dano: Number(indice),
          pieza,
        })),
      });
      setEstimacion(respuesta);
    } catch (err) {
      setErrorEstimacion(clasificarError(err).mensaje);
    } finally {
      setCalculando(false);
    }
  };

  /* ---------------------------------- Render ---------------------------------- */
  const puedeAnalizar = !!foto && !!vehiculoId && fase !== "analizando";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Cotización con foto</h1>
        <p className={styles.subtitulo}>
          Sube una foto del daño y obtén un rango aproximado de reparación en pocos segundos.
        </p>
      </header>

      {(fase === "inicio" || fase === "analizando" || fase === "error") && (
        <section className={styles.paso} aria-labelledby="titulo-paso-foto">
          <h2 id="titulo-paso-foto" className={styles.pasoTitulo}>
            1. Elige el vehículo y la foto
          </h2>

          {errorVehiculos && <Info severity="error">{errorVehiculos}</Info>}

          <div className={styles.campo}>
            <label htmlFor="vehiculo" className={styles.label}>
              Vehículo
            </label>
            <select
              id="vehiculo"
              className={styles.select}
              value={vehiculoId}
              disabled={cargandoVehiculos || fase === "analizando"}
              onChange={(e) => setVehiculoId(e.target.value)}
            >
              <option value="">
                {cargandoVehiculos ? "Cargando vehículos…" : "Selecciona tu vehículo…"}
              </option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} · {v.placa}
                </option>
              ))}
            </select>
            {!cargandoVehiculos && vehiculos.length === 0 && !errorVehiculos && (
              <p className={styles.ayuda}>
                Aún no tienes vehículos. <Link href="/mis-vehiculos">Registra uno</Link> para cotizar.
              </p>
            )}
          </div>

          <SelectorFoto
            key={claveSelector}
            onFotoSeleccionada={alSeleccionarFoto}
            deshabilitado={fase === "analizando"}
          />

          <div className={styles.acciones}>
            <Button color="green" onClick={analizar} disabled={!puedeAnalizar}>
              {fase === "analizando" ? "Analizando…" : "Analizar daños"}
            </Button>
            {MODO_DESARROLLO && (
              <Button color="yellow" onClick={cargarDemo} disabled={fase === "analizando"}>
                Ver ejemplo (solo desarrollo)
              </Button>
            )}
          </div>

          {fase === "analizando" && (
            <div className={styles.cargando} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              Analizando tu foto… esto toma unos segundos.
            </div>
          )}
        </section>
      )}

      {fase === "error" && error && (
        <ErrorResultado error={error} onReintentar={analizar} onNuevaFoto={nuevaFoto} />
      )}

      {fase === "resultado" && analisis && fotoUrl && (
        <div className={styles.resultado}>
          <ResumenCosto
            estimacion={estimacion}
            establecimiento={establecimiento}
            onCambiarEstablecimiento={setEstablecimiento}
            totalDanos={analisis.danos_detectados.length}
            asignados={asignados}
          />

          <div className={styles.columnas}>
            <FotoAnalizada
              src={fotoUrl}
              danos={analisis.danos_detectados}
              resaltado={resaltado}
              onResaltar={setResaltado}
            />

            <section className={styles.panelDanos} aria-labelledby="titulo-danos">
              <h2 id="titulo-danos" className={styles.pasoTitulo}>
                Daños detectados ({analisis.danos_detectados.length})
              </h2>
              <p className={styles.ayuda}>
                Indica qué pieza tiene cada daño para calcular el costo con el catálogo de precios.
              </p>

              <ListaDanos
                danos={analisis.danos_detectados}
                asignaciones={asignaciones}
                onAsignar={asignarPieza}
                estimacion={estimacion}
                establecimiento={establecimiento}
                resaltado={resaltado}
                onResaltar={setResaltado}
                deshabilitado={calculando}
              />

              {errorEstimacion && <Info severity="error">{errorEstimacion}</Info>}

              <div className={styles.acciones}>
                <Button color="green" onClick={calcular} disabled={asignados === 0 || calculando}>
                  {calculando ? "Calculando…" : estimacion ? "Recalcular estimado" : "Calcular estimado"}
                </Button>
                <Button color="orange" onClick={nuevaFoto} disabled={calculando}>
                  Analizar otra foto
                </Button>
              </div>
            </section>
          </div>

          {estimacion && <Advertencias estimacion={estimacion} />}

          {estimacion && (
            <div className={styles.siguiente}>
              <p>¿Quieres repararlo? Encuentra talleres aliados cerca de ti.</p>
              <Link href="/talleres-aliados" className={styles.enlaceBoton}>
                Ver talleres cercanos
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
