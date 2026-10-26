"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button/Button";
import Info from "@/app/components/ui/Info/Info";
import SelectorFoto from "@/app/components/ui/SelectorFoto/SelectorFoto";
import { analisisService, clasificarError } from "@/app/lib/api/analisis";
import type {
  AnalisisDanosResponse,
  ErrorResultado as ErrorResultadoTipo,
  EstimacionResponse,
  ExtraCatalogo,
  HallazgoFoto,
  PiezaCatalogo,
  ResultadoAgregar,
  TipoEstablecimiento,
} from "@/app/types/cotizacionResultado";
import Advertencias from "./Advertencias";
import ErrorResultado from "./ErrorResultado";
import FotoAnalizada from "./FotoAnalizada";
import ListaDanos from "./ListaDanos";
import ResumenCosto from "./ResumenCosto";
import { buscarPiezaCatalogo, categoriaEstimador, precioCatalogo } from "./ResultadoCotizacion.utils";
import styles from "./ResultadoCotizacion.module.css";

type Fase = "inicio" | "analizando" | "resultado" | "error";

interface AnalisisFotoProps {
  /** Vehículo elegido en «1. Datos del siniestro»; null si todavía no eligió. */
  vehiculoId: number | null;
  /** Piezas del catálogo del vehículo (con precios), cargadas por la página. */
  catalogo: PiezaCatalogo[];
  /** Pasa las piezas confirmadas al presupuesto de la cotización. */
  onAgregarAlPresupuesto: (hallazgos: HallazgoFoto[]) => ResultadoAgregar;
}

/**
 * Cotización con foto dentro del módulo de Cotización: foto -> YOLO -> piezas ->
 * rango de costo, con la opción de volcar el resultado al presupuesto.
 */
export default function AnalisisFoto({ vehiculoId, catalogo, onAgregarAlPresupuesto }: AnalisisFotoProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const [claveSelector, setClaveSelector] = useState(0);

  const [fase, setFase] = useState<Fase>("inicio");
  const [error, setError] = useState<ErrorResultadoTipo | null>(null);
  const [analisis, setAnalisis] = useState<AnalisisDanosResponse | null>(null);

  const [asignaciones, setAsignaciones] = useState<Record<number, string>>({});
  const [estimacion, setEstimacion] = useState<EstimacionResponse | null>(null);
  const [extras, setExtras] = useState<ExtraCatalogo[]>([]);
  const [calculando, setCalculando] = useState(false);
  const [errorEstimacion, setErrorEstimacion] = useState<string | null>(null);
  const [establecimiento, setEstablecimiento] = useState<TipoEstablecimiento>("multimarca");
  const [resaltado, setResaltado] = useState<number | null>(null);
  const [resumenAgregado, setResumenAgregado] = useState<ResultadoAgregar | null>(null);

  /* Libera la URL temporal de la foto al desmontar */
  useEffect(() => {
    return () => {
      if (urlRef.current?.startsWith("blob:")) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const reemplazarUrl = (nueva: string | null) => {
    if (urlRef.current?.startsWith("blob:")) URL.revokeObjectURL(urlRef.current);
    urlRef.current = nueva;
    setFotoUrl(nueva);
  };

  const reiniciarResultados = () => {
    setAnalisis(null);
    setEstimacion(null);
    setExtras([]);
    setAsignaciones({});
    setErrorEstimacion(null);
    setResumenAgregado(null);
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
      const respuesta = await analisisService.analizarFoto(foto);
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

  const asignarPieza = (indice: number, pieza: string) => {
    setAsignaciones((prev) => {
      const siguiente = { ...prev };
      if (pieza) siguiente[indice] = pieza;
      else delete siguiente[indice];
      return siguiente;
    });
    setEstimacion(null); // los totales dejan de ser válidos al cambiar piezas
    setExtras([]);
    setErrorEstimacion(null);
    setResumenAgregado(null);
  };

  const asignados = Object.keys(asignaciones).length;

  const calcular = async () => {
    if (!analisis || asignados === 0) return;

    const lista = Object.entries(asignaciones).map(([indice, pieza]) => ({
      indice: Number(indice),
      pieza,
      categoria: categoriaEstimador(pieza),
    }));
    const paraEstimador = lista.filter((a) => a.categoria !== null);

    if (paraEstimador.length > 0 && vehiculoId === null) {
      setErrorEstimacion("Selecciona el vehículo en «1. Datos del siniestro» para calcular el estimado.");
      return;
    }

    setCalculando(true);
    setErrorEstimacion(null);
    try {
      // 1) Categorías con rango de precios (catálogo de reparación del backend)
      let respuesta: EstimacionResponse | null = null;
      if (paraEstimador.length > 0 && vehiculoId !== null) {
        respuesta = await analisisService.estimar({
          vehiculo_id: vehiculoId,
          danos: analisis.danos_detectados.map((d) => ({
            tipo_dano: d.tipo_dano,
            severidad: d.severidad,
            confianza: d.confianza,
          })),
          asignaciones: paraEstimador.map((a) => ({
            indice_dano: a.indice,
            pieza: a.categoria as string,
          })),
        });
      }

      // 2) Lo que el estimador no pudo cotizar se cotiza con el precio de catálogo de la pieza
      const pendientes = new Map<number, { indice: number; pieza: string }>();
      for (const a of lista) {
        if (a.categoria === null) pendientes.set(a.indice, { indice: a.indice, pieza: a.pieza });
      }
      for (const nE of respuesta?.danos_no_estimados ?? []) {
        const original = asignaciones[nE.indice_dano];
        if (original) pendientes.set(nE.indice_dano, { indice: nE.indice_dano, pieza: original });
      }

      const porPieza = new Map<number, ExtraCatalogo>();
      for (const { indice, pieza } of pendientes.values()) {
        const encontrada = buscarPiezaCatalogo(pieza, catalogo);
        const valor = encontrada ? precioCatalogo(encontrada) : 0;
        if (!encontrada || valor <= 0) continue;
        const previa = porPieza.get(encontrada.id);
        if (previa) previa.indices.push(indice);
        else porPieza.set(encontrada.id, { id: encontrada.id, nombre: encontrada.nombre, indices: [indice], valor });
      }

      const extrasCalculados = [...porPieza.values()];
      if (!respuesta && extrasCalculados.length === 0) {
        setErrorEstimacion(
          "No tenemos precio para esa pieza en el catálogo de tu vehículo. Elige otra pieza de la lista o agrégala manualmente en «2. Detalle de Piezas».",
        );
        return;
      }
      setEstimacion(respuesta);
      setExtras(extrasCalculados);
    } catch (err) {
      setErrorEstimacion(clasificarError(err).mensaje);
    } finally {
      setCalculando(false);
    }
  };

  /** Agrupa los daños por pieza y los envía al presupuesto de la cotización. */
  const agregarAlPresupuesto = () => {
    if (!analisis) return;
    const porPieza = new Map<string, string[]>();
    for (const [indice, pieza] of Object.entries(asignaciones)) {
      const tipo = analisis.danos_detectados[Number(indice)]?.tipo_dano;
      if (!tipo) continue;
      porPieza.set(pieza, [...(porPieza.get(pieza) ?? []), tipo]);
    }
    const hallazgos: HallazgoFoto[] = [...porPieza].map(([pieza, tipos]) => ({ pieza, tipos }));
    setResumenAgregado(onAgregarAlPresupuesto(hallazgos));
  };

  const hayFoto = fase !== "resultado";

  return (
    <section className={styles.paso} aria-labelledby="titulo-cotizar-foto">
      <div>
        <h2 id="titulo-cotizar-foto" className={styles.pasoTitulo}>
          📷 Cotiza con una foto (opcional)
        </h2>
        <p className={styles.ayuda}>
          Sube o toma una foto del daño: detectamos los daños, estimamos el costo y puedes pasar las
          piezas al presupuesto.
        </p>
      </div>

      {hayFoto && (
        <>
          <SelectorFoto
            key={claveSelector}
            onFotoSeleccionada={alSeleccionarFoto}
            deshabilitado={fase === "analizando"}
          />

          <div className={styles.acciones}>
            <Button color="green" onClick={analizar} disabled={!foto || fase === "analizando"}>
              {fase === "analizando" ? "Analizando…" : "Analizar daños"}
            </Button>
          </div>

          {fase === "analizando" && (
            <div className={styles.cargando} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              Analizando tu foto… esto toma unos segundos.
            </div>
          )}
        </>
      )}

      {fase === "error" && error && (
        <ErrorResultado error={error} onReintentar={analizar} onNuevaFoto={nuevaFoto} />
      )}

      {fase === "resultado" && analisis && fotoUrl && (
        <div className={styles.resultado}>
          <ResumenCosto
            estimacion={estimacion}
            extras={extras}
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
              <h3 id="titulo-danos" className={styles.pasoTitulo}>
                Daños detectados ({analisis.danos_detectados.length})
              </h3>
              <p className={styles.ayuda}>
                Indica qué pieza tiene cada daño para calcular el costo con el catálogo de precios.
              </p>

              <ListaDanos
                danos={analisis.danos_detectados}
                asignaciones={asignaciones}
                onAsignar={asignarPieza}
                estimacion={estimacion}
                extras={extras}
                catalogo={catalogo}
                establecimiento={establecimiento}
                resaltado={resaltado}
                onResaltar={setResaltado}
                deshabilitado={calculando}
              />

              {errorEstimacion && <Info severity="error">{errorEstimacion}</Info>}

              {resumenAgregado && (
                <div role="status" className={styles.resumenAgregado}>
                  {resumenAgregado.agregadas.length > 0 && (
                    <Info severity="success">
                      Se agregaron al presupuesto: {resumenAgregado.agregadas.join(", ")}.
                    </Info>
                  )}
                  {resumenAgregado.sinCatalogo.length > 0 && (
                    <Info severity="warning">
                      {vehiculoId === null
                        ? "Selecciona el vehículo en «1. Datos del siniestro» para cargar sus piezas y poder agregarlas."
                        : `No encontramos en el catálogo de tu vehículo: ${resumenAgregado.sinCatalogo.join(", ")}. Agrégalas manualmente en «2. Detalle de Piezas».`}
                    </Info>
                  )}
                </div>
              )}

              <div className={styles.acciones}>
                <Button color="green" onClick={calcular} disabled={asignados === 0 || calculando}>
                  {calculando ? "Calculando…" : estimacion ? "Recalcular estimado" : "Calcular estimado"}
                </Button>
                <Button color="yellow" onClick={agregarAlPresupuesto} disabled={asignados === 0 || calculando}>
                  Agregar al presupuesto
                </Button>
                <Button color="orange" onClick={nuevaFoto} disabled={calculando}>
                  Analizar otra foto
                </Button>
              </div>
            </section>
          </div>

          {estimacion && <Advertencias estimacion={estimacion} />}

          {(estimacion || extras.length > 0) && (
            <div className={styles.siguiente}>
              <p>¿Quieres repararlo? Encuentra talleres aliados cerca de ti.</p>
              <Link href="/talleres-aliados" className={styles.enlaceBoton}>
                Ver talleres cercanos
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
