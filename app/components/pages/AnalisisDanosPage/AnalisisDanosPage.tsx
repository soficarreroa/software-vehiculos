"use client";

import { useState } from "react";
import Button from "@/app/components/ui/Button/Button";
import Info from "@/app/components/ui/Info/Info";
import SelectorFoto from "@/app/components/ui/SelectorFoto/SelectorFoto";
import { ERROR_MESSAGES } from "./AnalisisDanos.constants";
import { analisisService, type ResultadoAnalisis } from "./AnalisisDanos.service";
import ResultadoAnalisisVista from "./ResultadoAnalisis";
import styles from "./AnalisisDanosPage.module.css";

export default function AnalisisDanosPage() {
  const [foto, setFoto] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cambiar la key reinicia el selector para analizar otra foto
  const [intento, setIntento] = useState(0);

  function alCambiarFoto(nueva: File | null) {
    setFoto(nueva);
    setResultado(null);
    setError(null);
  }

  async function analizar() {
    if (!foto) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      setResultado(await analisisService.analizarFoto(foto));
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.ANALISIS_ERROR);
    } finally {
      setCargando(false);
    }
  }

  function analizarOtra() {
    setFoto(null);
    setResultado(null);
    setError(null);
    setIntento((n) => n + 1);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analizar daños</h1>
        <p className={styles.subtitle}>
          Toma una foto del vehículo o súbela desde tu galería y detectamos los daños.
        </p>
      </header>

      <SelectorFoto key={intento} onFotoSeleccionada={alCambiarFoto} deshabilitado={cargando} />
      <div className={styles.accionAnalizar}>
        <Button color="orange" onClick={analizar} disabled={!foto || cargando}>
          {cargando ? "Analizando foto..." : "Analizar daños"}
        </Button>
      </div>

      {error && <Info severity="error">{error}</Info>}

      {resultado && (
        <>
          <ResultadoAnalisisVista resultado={resultado} />
          <div className={styles.accionAnalizar}>
            <Button color="green" onClick={analizarOtra}>
              Analizar otra foto
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
