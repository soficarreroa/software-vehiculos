"use client";

import { useState } from "react";
import Card from "../ui/Card/Card";
import Button from "../ui/Button/Button";
import Info from "../ui/Info/Info";
import Pill from "../ui/Pill/Pill";
import styles from "./MarcoLegal.module.css";

interface LeyData {
  id: number;
  año: number;
  icono: string;
  titulo: string;
  resumen: string;
  detalle: string;
  alerta?: string;
  categoria: "trafico" | "civil" | "seguros" | "datos" | "tecnologia";
}

const leyes: LeyData[] = [
  {
    id: 1,
    año: 2002,
    icono: "🚦",
    titulo: "Ley 769 de 2002 – Código Nacional de Tránsito",
    resumen: "Ley madre del tránsito en Colombia.",
    detalle:
      "Define qué es un accidente de tránsito, las obligaciones de los conductores al momento del siniestro y las sanciones aplicables. Es la base legal sobre la que opera toda la gestión de choques en el país.",
    categoria: "trafico",
  },
  {
    id: 2,
    año: 2009,
    icono: "🗂️",
    titulo: "Resolución 3245 de 2009 – RUNT",
    resumen: "Registro Único Nacional de Tránsito.",
    detalle:
      "Crea el RUNT, el sistema oficial donde se registran todos los vehículos, conductores y accidentes del país. Una futura integración permitiría validar datos vehiculares en tiempo real.",
    categoria: "tecnologia",
  },
  {
    id: 3,
    año: 2012,
    icono: "⚖️",
    titulo: "Código Civil – Art. 2341 – Responsabilidad Civil",
    resumen: "Obligación de indemnizar daños causados a terceros.",
    detalle:
      "Establece que quien cause un daño a otro está obligado a repararlo. Los reportes generados por esta app sirven como soporte técnico para negociar dicha indemnización de forma justa.",
    categoria: "civil",
  },
  {
    id: 4,
    año: 2012,
    icono: "🛡️",
    titulo: "Ley 1581 de 2012 – Protección de Datos",
    resumen: "Regula el uso de tus datos e imágenes.",
    detalle:
      "Tus fotos y datos vehiculares están protegidos. Solo se comparten con talleres aliados bajo tu autorización para fines de cotización y reparación.",
    categoria: "datos",
  },
  {
    id: 5,
    año: 2015,
    icono: "📋",
    titulo: "Decreto 1079 de 2015 – Reglamentario del Transporte",
    resumen: "Norma todo el sector transporte en Colombia.",
    detalle:
      "Compila toda la reglamentación del sector transporte: revisión técnico-mecánica, seguros mínimos para circular y procedimientos ante accidentes.",
    categoria: "trafico",
  },
  {
    id: 6,
    año: 2017,
    icono: "📸",
    titulo: "Ley 1843 de 2017 – Evidencia Digital en Tránsito",
    resumen: "Fotografías como evidencia legal válida.",
    detalle:
      "Regula el uso de medios tecnológicos para el control del tránsito. Las fotos tomadas en la app tienen valor probatorio y pueden usarse en conciliaciones o procesos legales.",
    alerta: "📌 Las fotos deben incluir metadatos de fecha, hora y ubicación.",
    categoria: "tecnologia",
  },
  {
    id: 7,
    año: 2022,
    icono: "🚗",
    titulo: "Ley 2251 de 2022 – Choques Simples",
    resumen: "Retiro inmediato del vehículo tras un choque leve.",
    detalle:
      "En accidentes con solo daños materiales, los vehículos deben retirarse de la vía de inmediato. Esta app permite documentar los daños antes de mover los vehículos, cumpliendo la ley.",
    alerta: "⚠️ No retirar el vehículo puede acarrear una multa de tránsito.",
    categoria: "trafico",
  },
  {
    id: 8,
    año: 2022,
    icono: "📜",
    titulo: "SOAT – ¿Qué cubre?",
    resumen: "Solo daños corporales, NO daños materiales.",
    detalle:
      "El SOAT cubre gastos médicos, hospitalización e incapacidad. No cubre daños a la carrocería. Para eso se necesita conciliación directa o un seguro Todo Riesgo.",
    alerta: "💡 Esta app cotiza los daños materiales que el SOAT NO cubre.",
    categoria: "seguros",
  },
];

const categorias = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "trafico", etiqueta: "🚦 Tráfico" },
  { valor: "civil", etiqueta: "⚖️ Civil" },
  { valor: "seguros", etiqueta: "🛡️ Seguros" },
  { valor: "datos", etiqueta: "🔒 Datos" },
  { valor: "tecnologia", etiqueta: "💻 Tecnología" },
];

const MarcoLegal = () => {
  const [abiertos, setAbiertos] = useState<number[]>([]);
  const [leidos, setLeidos] = useState<number[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const toggleAbierto = (id: number) => {
    setAbiertos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleLeido = (id: number) => {
    setLeidos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const leyesFiltradas = leyes.filter((ley) => {
    const coincideBusqueda =
      ley.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      ley.resumen.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(ley.año).includes(busqueda);
    const coincideCategoria =
      categoriaActiva === "todas" || ley.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.headerMain}>
        <div>
          <h1 className={styles.title}>Marco Legal</h1>
          <p className={styles.subtitle}>
            Normativa vigente ordenada cronológicamente.
          </p>
        </div>
        <Pill>SOAT Vigente</Pill>
      </div>

      {/* Info de aviso */}
      <Info severity="error">
        <span>¿Necesitas ayuda inmediata en la vía?</span>
        <Button color="red" onClick={() => alert("Llamando asistencia...")}>
          Llamar Asistencia
        </Button>
      </Info>

      {/* Buscador */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Buscar por ley, año o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {categorias.map((cat) => (
          <button
            key={cat.valor}
            onClick={() => setCategoriaActiva(cat.valor)}
            className={`${styles.filtroBtn} ${
              categoriaActiva === cat.valor ? styles.filtroBtnActivo : ""
            }`}
          >
            {cat.etiqueta}
          </button>
        ))}
      </div>

      <p className={styles.contador}>
        Mostrando <strong>{leyesFiltradas.length}</strong> de {leyes.length}{" "}
        normas · <strong>{leidos.length}</strong> revisadas
      </p>

      {/* Sin resultados */}
      {leyesFiltradas.length === 0 && (
        <div className={styles.sinResultados}>
          <span style={{ fontSize: "2rem" }}>🔎</span>
          <p>No se encontraron normas con esa búsqueda.</p>
        </div>
      )}

      {/* Lista de leyes */}
      <div className={styles.grid}>
        {leyesFiltradas.map((ley) => {
          const estaAbierto = abiertos.includes(ley.id);
          const estaLeido = leidos.includes(ley.id);

          return (
            <div
              key={ley.id}
              className={`${styles.leyCard} ${estaLeido ? styles.leyCardLeida : ""} ${estaAbierto ? styles.leyCardAbierta : ""}`}
            >
              {/* Card existente para mostrar el resumen */}
              <Card
                icon={ley.icono}
                title={`${ley.año} · ${ley.titulo}`}
                description={ley.resumen}
                onClick={() => toggleAbierto(ley.id)}
              />

              {/* Botones debajo del Card */}
              <div className={styles.botonesCard}>
                <Button
                  color="yellow"
                  onClick={() => toggleAbierto(ley.id)}
                >
                  {estaAbierto ? "▲ Ver menos" : "▼ Ver más"}
                </Button>
                <Button
                  color="green"
                  onClick={() => toggleLeido(ley.id)}
                >
                  {estaLeido ? "✓ Leído" : "Marcar leído"}
                </Button>
              </div>

              {/* Detalle expandible */}
              {estaAbierto && (
                <div className={styles.cardBody}>
                  <p className={styles.detalle}>{ley.detalle}</p>
                  {ley.alerta && (
                    <div className={styles.alertaBox}>{ley.alerta}</div>
                  )}
                  <div className={styles.cardFooter}>
                    <span className={styles.categoriaTag}>
                      {categorias.find((c) => c.valor === ley.categoria)?.etiqueta}
                    </span>
                    <span className={styles.añoTag}>Año {ley.año}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default MarcoLegal;
