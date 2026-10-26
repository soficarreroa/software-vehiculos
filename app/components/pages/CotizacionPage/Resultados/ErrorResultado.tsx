"use client";

import Button from "@/app/components/ui/Button/Button";
import type { ErrorResultado as ErrorResultadoTipo, TipoErrorResultado } from "@/app/types/cotizacionResultado";
import { MAX_MB } from "./ResultadoCotizacion.constants";
import styles from "./ResultadoCotizacion.module.css";

interface Config {
  icono: string;
  titulo: string;
  tono: "error" | "warning" | "success";
  consejos: string[];
  permiteReintentar: boolean;
}

const CONFIG: Record<TipoErrorResultado, Config> = {
  formato: {
    icono: "🖼️",
    titulo: "Formato de archivo no soportado",
    tono: "warning",
    consejos: [
      "Usa una foto en formato JPG, PNG o WEBP.",
      "Si usas iPhone, activa Ajustes → Cámara → Formatos → «Más compatible».",
    ],
    permiteReintentar: false,
  },
  demasiado_grande: {
    icono: "📦",
    titulo: "La foto pesa demasiado",
    tono: "warning",
    consejos: [
      `El máximo permitido es ${MAX_MB} MB.`,
      "Toma la foto con una resolución menor o recórtala antes de subirla.",
    ],
    permiteReintentar: false,
  },
  foto_poco_clara: {
    icono: "🌫️",
    titulo: "No pudimos ver bien tu foto",
    tono: "warning",
    consejos: [
      "Toma la foto con buena luz y sin contraluz ni reflejos.",
      "Enfoca el daño a 1 o 2 metros de distancia.",
      "Mantén el teléfono quieto para evitar que salga movida.",
    ],
    permiteReintentar: false,
  },
  sin_danos: {
    icono: "✅",
    titulo: "No detectamos daños en la foto",
    tono: "success",
    consejos: [
      "Acércate un poco más al daño y que ocupe buena parte de la imagen.",
      "Prueba otro ángulo o con otra iluminación.",
      "Los daños muy leves pueden no ser visibles para el análisis automático.",
    ],
    permiteReintentar: false,
  },
  servicio: {
    icono: "🛠️",
    titulo: "El análisis no está disponible en este momento",
    tono: "error",
    consejos: ["Es un problema nuestro, no de tu foto.", "Inténtalo de nuevo en unos minutos."],
    permiteReintentar: true,
  },
  red: {
    icono: "📡",
    titulo: "Sin conexión con el servidor",
    tono: "error",
    consejos: ["Revisa tu conexión a internet.", "Cuando vuelva la señal, inténtalo de nuevo."],
    permiteReintentar: true,
  },
  desconocido: {
    icono: "⚠️",
    titulo: "No se pudo completar el análisis",
    tono: "error",
    consejos: ["Inténtalo de nuevo. Si el problema continúa, usa otra foto."],
    permiteReintentar: true,
  },
};

interface ErrorResultadoProps {
  error: ErrorResultadoTipo;
  onReintentar: () => void;
  onNuevaFoto: () => void;
}

export default function ErrorResultado({ error, onReintentar, onNuevaFoto }: ErrorResultadoProps) {
  const config = CONFIG[error.tipo];

  return (
    <section
      className={`${styles.errorCard} ${styles[`tono_${config.tono}`]}`}
      role={config.tono === "success" ? "status" : "alert"}
    >
      <span className={styles.errorIcono} aria-hidden="true">
        {config.icono}
      </span>
      <h2 className={styles.errorTitulo}>{config.titulo}</h2>
      {error.mensaje && <p className={styles.errorMensaje}>{error.mensaje}</p>}
      <ul className={styles.consejos}>
        {config.consejos.map((consejo) => (
          <li key={consejo}>{consejo}</li>
        ))}
      </ul>
      <div className={styles.acciones}>
        {config.permiteReintentar && (
          <Button color="green" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
        <Button color={config.permiteReintentar ? "orange" : "green"} onClick={onNuevaFoto}>
          Elegir otra foto
        </Button>
      </div>
    </section>
  );
}
