"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button/Button";
import Info from "@/app/components/ui/Info/Info";
import SelectorFoto from "@/app/components/ui/SelectorFoto/SelectorFoto";
import { ERROR_MESSAGES } from "./AnalisisFoto.constants";
import { analisisService, type ResultadoAnalisis } from "./AnalisisFoto.service";
import FotoConDanos from "./FotoConDanos";
import styles from "./AnalisisFoto.module.css";

interface AnalisisFotoProps {
  /** Resultado del análisis (o null al cambiar/quitar la foto). */
  onResultado: (resultado: ResultadoAnalisis | null) => void;
  marcaVehiculo?: string | null;
}

function mapearDanioACategorias(tipoDano: string): string[] {
  const t = tipoDano.toLowerCase();
  const categorias = new Set<string>();

  if (t === "abolladura" || t === "rayon") {
    categorias.add("Carrocería");
  }
  if (t === "grieta") {
    categorias.add("Carrocería");
  }
  if (t === "luz_rota") {
    categorias.add("Electricidad");
  }
  if (t === "llanta_baja") {
    categorias.add("Llantas");
  }

  return Array.from(categorias);
}

export default function AnalisisFoto({ onResultado, marcaVehiculo }: AnalisisFotoProps) {
  const router = useRouter();
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cambia para volver a montar el selector con la foto vacía
  const [clave, setClave] = useState(0);
  const urlActual = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlActual.current) URL.revokeObjectURL(urlActual.current);
    };
  }, []);

  function guardarUrl(nueva: string | null) {
    if (urlActual.current) URL.revokeObjectURL(urlActual.current);
    urlActual.current = nueva;
    setFotoUrl(nueva);
  }

  function reiniciarResultado() {
    setResultado(null);
    setError(null);
    onResultado(null);
  }

  function alCambiarFoto(nueva: File | null) {
    setFoto(nueva);
    guardarUrl(nueva ? URL.createObjectURL(nueva) : null);
    reiniciarResultado();
  }

  function analizarOtraFoto() {
    setFoto(null);
    guardarUrl(null);
    reiniciarResultado();
    setClave((actual) => actual + 1);
  }

  async function analizar() {
    if (!foto) return;
    setCargando(true);
    reiniciarResultado();
    try {
      const nuevo = await analisisService.analizarFoto(foto);
      setResultado(nuevo);
      onResultado(nuevo);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.ANALISIS_ERROR);
    } finally {
      setCargando(false);
    }
  }

  const hayDanos = (resultado?.danos_detectados.length ?? 0) > 0;

  function verTalleresQueReparan() {
    if (!resultado || resultado.danos_detectados.length === 0) return;
    const tiposUnicos = Array.from(
      new Set(resultado.danos_detectados.map((d) => d.tipo_dano.toLowerCase()).filter(Boolean)),
    );
    if (tiposUnicos.length === 0) return;
    const params = new URLSearchParams();
    params.set("tipos", tiposUnicos.join(","));
    if (marcaVehiculo) {
      params.set("marca", marcaVehiculo);
    }
    const categorias = new Set<string>();
    for (const dano of resultado.danos_detectados) {
      for (const cat of mapearDanioACategorias(dano.tipo_dano)) {
        categorias.add(cat);
      }
    }
    if (categorias.size > 0) {
      params.set("categorias", Array.from(categorias).join(","));
    }
    router.push(`/talleres-aliados?${params.toString()}`);
  }

  if (resultado && hayDanos && fotoUrl) {
    return (
      <div className={styles.root}>
        <FotoConDanos url={fotoUrl} danos={resultado.danos_detectados} />
        <div className={styles.acciones}>
          <Button color="orange" onClick={verTalleresQueReparan}>
            Ver talleres que reparan esto
          </Button>
          <Button color="orange" onClick={analizarOtraFoto}>
            Intentar otra imagen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <SelectorFoto key={clave} onFotoSeleccionada={alCambiarFoto} deshabilitado={cargando} />

      <div className={styles.acciones}>
        <Button color="orange" onClick={analizar} disabled={!foto || cargando}>
          {cargando ? "Analizando foto..." : "Analizar daños"}
        </Button>
      </div>

      {cargando && (
        <Info severity="warning">La fotografía está siendo analizada para detectar posibles daños. Este proceso puede tardar unos segundos.</Info>
      )}

      {error && <Info severity="error">{error}</Info>}
      {resultado && !hayDanos && (
        <Info severity="warning">{resultado.mensaje ?? "No se detectaron daños en la foto"}</Info>
      )}
    </div>
  );
}
