"use client";

import { useState } from "react";
import Button from "@/app/components/ui/Button/Button";
import Info from "@/app/components/ui/Info/Info";
import SelectorFoto from "@/app/components/ui/SelectorFoto/SelectorFoto";
import {
  ERROR_MESSAGES,
  ETIQUETA_COTIZACION,
  NOMBRE_SEVERIDAD,
  NOMBRE_TIPO_DANO,
} from "./AnalisisFoto.constants";
import { analisisService, type ResultadoAnalisis } from "./AnalisisFoto.service";
import ResultadoAnalisisVista from "./ResultadoAnalisis";
import styles from "./AnalisisFoto.module.css";

interface AnalisisFotoProps {
  /** Etiquetas de la cotización que se sugieren según lo detectado ([] si no hay). */
  onEtiquetasSugeridas: (etiquetas: string[]) => void;
  /** Texto con los daños detectados, para sumarlo a las notas de la cotización. */
  onAgregarANotas: (texto: string) => void;
}

function etiquetasDe(resultado: ResultadoAnalisis): string[] {
  const etiquetas = resultado.danos_detectados
    .map((dano) => ETIQUETA_COTIZACION[dano.tipo_dano])
    .filter((etiqueta): etiqueta is string => Boolean(etiqueta));
  return [...new Set(etiquetas)];
}

function textoParaNotas(resultado: ResultadoAnalisis): string {
  const detalle = resultado.danos_detectados.map((dano) => {
    const nombre = NOMBRE_TIPO_DANO[dano.tipo_dano] ?? dano.tipo_dano;
    const severidad = dano.severidad ? NOMBRE_SEVERIDAD[dano.severidad] ?? dano.severidad : null;
    return severidad ? `${nombre} (${severidad.toLowerCase()})` : nombre;
  });
  return `Daños detectados en la foto: ${detalle.join(", ")}.`;
}

export default function AnalisisFoto({ onEtiquetasSugeridas, onAgregarANotas }: AnalisisFotoProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agregadoANotas, setAgregadoANotas] = useState(false);

  function alCambiarFoto(nueva: File | null) {
    setFoto(nueva);
    setResultado(null);
    setError(null);
    setAgregadoANotas(false);
    onEtiquetasSugeridas([]);
  }

  async function analizar() {
    if (!foto) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    setAgregadoANotas(false);
    onEtiquetasSugeridas([]);
    try {
      const nuevo = await analisisService.analizarFoto(foto);
      setResultado(nuevo);
      onEtiquetasSugeridas(etiquetasDe(nuevo));
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.ANALISIS_ERROR);
    } finally {
      setCargando(false);
    }
  }

  function agregarANotas() {
    if (!resultado) return;
    onAgregarANotas(textoParaNotas(resultado));
    setAgregadoANotas(true);
  }

  const hayDanos = (resultado?.danos_detectados.length ?? 0) > 0;

  return (
    <div className={styles.root}>
      <SelectorFoto onFotoSeleccionada={alCambiarFoto} deshabilitado={cargando} />

      <div className={styles.acciones}>
        <Button color="orange" onClick={analizar} disabled={!foto || cargando}>
          {cargando ? "Analizando foto..." : "Analizar daños"}
        </Button>
      </div>

      {error && <Info severity="error">{error}</Info>}

      {resultado && (
        <>
          <ResultadoAnalisisVista resultado={resultado} />
          {hayDanos && (
            <>
              <p className={styles.ayuda}>
                ✨ Marcamos con una estrella las etiquetas de daño sugeridas en cada pieza que agregues.
              </p>
              <div className={styles.acciones}>
                <Button color="green" onClick={agregarANotas} disabled={agregadoANotas}>
                  {agregadoANotas ? "Agregado a las notas ✓" : "Agregar a las notas"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
