"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import styles from "./SelectorFoto.module.css";

export const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
export const MAX_MB = 10;

interface SelectorFotoProps {
  onFotoSeleccionada: (archivo: File | null) => void;
  deshabilitado?: boolean;
}

export default function SelectorFoto({
  onFotoSeleccionada,
  deshabilitado = false,
}: SelectorFotoProps) {
  const inputCamara = useRef<HTMLInputElement>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Libera la URL temporal al cambiar de foto o al desmontar
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validar = (archivo: File): string => {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return "Formato no soportado. Usa JPG, PNG o WEBP.";
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      return `La imagen supera el máximo de ${MAX_MB} MB.`;
    }
    return "";
  };

  const manejarArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    const mensaje = validar(archivo);
    if (mensaje) {
      setError(mensaje);
      return; // conserva la foto anterior si ya había una
    }

    setError("");
    setPreview(URL.createObjectURL(archivo));
    onFotoSeleccionada(archivo);
  };

  const quitarFoto = () => {
    setPreview(null);
    setError("");
    onFotoSeleccionada(null);
  };

  return (
    <div className={styles.contenedor}>
      {/* capture="environment" abre la cámara trasera en celulares;
          en computador se comporta como un selector de archivos */}
      <input
        ref={inputCamara}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={manejarArchivo}
      />
      <input
        ref={inputGaleria}
        type="file"
        accept={TIPOS_PERMITIDOS.join(",")}
        hidden
        onChange={manejarArchivo}
      />

      {preview ? (
        <div className={styles.previewBox}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa de la foto del vehículo"
            className={styles.preview}
          />
          <div className={styles.acciones}>
            <button
              type="button"
              className={styles.boton}
              disabled={deshabilitado}
              onClick={() => inputGaleria.current?.click()}
            >
              Cambiar foto
            </button>
            <button
              type="button"
              className={styles.botonSecundario}
              disabled={deshabilitado}
              onClick={quitarFoto}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.boton}
            disabled={deshabilitado}
            onClick={() => inputCamara.current?.click()}
          >
            Tomar foto
          </button>
          <button
            type="button"
            className={styles.botonSecundario}
            disabled={deshabilitado}
            onClick={() => inputGaleria.current?.click()}
          >
            Elegir de la galería
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}