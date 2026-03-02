pero aun no he subido nada o sea esto
"use client";

import { useState } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────
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

// ── Datos: leyes ordenadas por año ─────────────────────────────────────────
const leyes: LeyData[] = [
  {
    id: 1,
    año: 2002,
    icono: "🚦",
    titulo: "Código Nacional de Tránsito (Ley 769 de 2002)",
    resumen: "Ley madre del tránsito en Colombia.",
    detalle:
      "Define qué es un accidente de tránsito, las obligaciones de los conductores al momento del siniestro, la jerarquía de responsabilidades y las sanciones aplicables. Es la base legal sobre la que opera toda la gestión de choques en el país. Esta app se enmarca directamente en su articulado al facilitar la documentación de daños materiales.",
    categoria: "trafico",
  },
  {
    id: 2,
    año: 2009,
    icono: "🗂️",
    titulo: "RUNT – Resolución 3245 de 2009",
    resumen: "Registro Único Nacional de Tránsito.",
    detalle:
      "Crea y reglamenta el RUNT, el sistema oficial donde se registran todos los vehículos, conductores, licencias y accidentes del país. La información de tu vehículo (placa, propietario, revisión técnico-mecánica) vive aquí. Una futura integración con el RUNT permitiría a esta app validar datos vehiculares en tiempo real.",
    categoria: "tecnologia",
  },
  {
    id: 3,
    año: 2012,
    icono: "⚖️",
    titulo: "Responsabilidad Civil Extracontractual (Código Civil – Art. 2341)",
    resumen: "Obligación de indemnizar daños causados a terceros.",
    detalle:
      "El artículo 2341 del Código Civil colombiano establece que quien cause un daño a otro está obligado a repararlo. En el contexto de accidentes de tránsito, esto significa que el conductor responsable debe cubrir los daños materiales del vehículo afectado. Los reportes generados por esta app sirven como soporte técnico para negociar dicha indemnización de forma justa.",
    categoria: "civil",
  },
  {
    id: 4,
    año: 2012,
    icono: "🛡️",
    titulo: "Protección de Datos Personales (Ley 1581 de 2012)",
    resumen: "Regula el uso de tus datos e imágenes.",
    detalle:
      "Esta ley establece los principios para el tratamiento de datos personales en Colombia. Tus fotos, información del vehículo y datos de contacto registrados en la app están protegidos bajo esta normativa. Solo se compartirán con talleres aliados bajo tu autorización expresa y para los fines específicos de cotización y reparación.",
    categoria: "datos",
  },
  {
    id: 5,
    año: 2015,
    icono: "📋",
    titulo: "Decreto Único Reglamentario del Transporte (Decreto 1079 de 2015)",
    resumen: "Norma todo el sector transporte en Colombia.",
    detalle:
      "Compila y unifica toda la reglamentación del sector transporte, incluyendo la revisión técnico-mecánica obligatoria, los seguros mínimos exigidos para circular, las condiciones de los vehículos automotores y los procedimientos ante accidentes. Es la referencia reglamentaria que complementa la Ley 769 de 2002.",
    categoria: "trafico",
  },
  {
    id: 6,
    año: 2017,
    icono: "📸",
    titulo: "Evidencia Digital en Tránsito (Ley 1843 de 2017)",
    resumen: "Fotografías y videos como evidencia legal válida.",
    detalle:
      "Regula el uso de medios tecnológicos (cámaras, fotografías, registros digitales) para el control del tránsito y como evidencia en procesos sancionatorios. Esta ley respalda directamente la funcionalidad principal de esta app: las fotos tomadas al momento del accidente tienen valor probatorio y pueden ser usadas en conciliaciones o procesos legales.",
    alerta:
      "📌 Las fotos deben incluir metadatos de fecha, hora y ubicación para mayor validez.",
    categoria: "tecnologia",
  },
  {
    id: 7,
    año: 2022,
    icono: "🚗",
    titulo: "Ley de Choques Simples (Ley 2251 de 2022)",
    resumen: "Retiro inmediato del vehículo tras un choque leve.",
    detalle:
      "Establece que en accidentes donde solo existan daños materiales (sin heridos), los vehículos deben ser retirados de la vía de forma inmediata para no obstruir el tráfico. Esta app fue diseñada precisamente para este escenario: permite documentar fotográficamente los daños antes de mover los vehículos, cumpliendo con la ley y protegiendo tu derecho a reclamar.",
    alerta: "⚠️ No retirar el vehículo puede acarrear una multa de tránsito.",
    categoria: "trafico",
  },
  {
    id: 8,
    año: 2022,
    icono: "📜",
    titulo: "¿Qué cubre mi SOAT?",
    resumen: "Solo daños corporales, NO daños materiales.",
    detalle:
      "El Seguro Obligatorio de Accidentes de Tránsito (SOAT) cubre únicamente gastos médicos, hospitalización, incapacidad y muerte de las víctimas. No cubre los daños materiales a la carrocería ni a los vehículos de terceros. Para los daños a la lata se requiere una conciliación directa entre conductores, un seguro Todo Riesgo, o en su defecto, un proceso civil de responsabilidad extracontractual.",
    alerta:
      "💡 Esta app genera la cotización de daños materiales que el SOAT NO cubre.",
    categoria: "seguros",
  },
];

// ── Categorías para el filtro ──────────────────────────────────────────────
const categorias = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "trafico", etiqueta: "🚦 Tráfico" },
  { valor: "civil", etiqueta: "⚖️ Civil" },
  { valor: "seguros", etiqueta: "🛡️ Seguros" },
  { valor: "datos", etiqueta: "🔒 Datos" },
  { valor: "tecnologia", etiqueta: "💻 Tecnología" },
];

// ── Componente principal ───────────────────────────────────────────────────
export default function InformacionLegal() {
  const [abiertos, setAbiertos] = useState<number[]>([]);
  const [leidos, setLeidos] = useState<number[]>([]);
  const [copiados, setCopiados] = useState<number[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const toggleAbierto = (id: number) => {
    setAbiertos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleLeido = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLeidos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const copiarInfo = (e: React.MouseEvent, ley: LeyData) => {
    e.stopPropagation();
    const texto = `${ley.titulo}\n\n${ley.detalle}${ley.alerta ? "\n\n" + ley.alerta : ""}`;
    navigator.clipboard.writeText(texto);
    setCopiados((prev) => [...prev, ley.id]);
    setTimeout(
      () => setCopiados((prev) => prev.filter((x) => x !== ley.id)),
      2000
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
    <div style={styles.page}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <div style={styles.navBrand}>🚗 AutoPerito</div>
        {["Inicio", "Mis Vehículos", "Nueva Cotización", "Historial"].map(
          (item) => (
            <a key={item} href="#" style={styles.navLink}>
              {item}
            </a>
          )
        )}
        <a href="#" style={{ ...styles.navLink, ...styles.navLinkActive }}>
          Marco Legal
        </a>
      </nav>

      {/* Contenido */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.titulo}>Centro de Información Legal</h1>
          <p style={styles.subtitulo}>
            Conoce tus derechos y deberes en la vía según la normativa vigente.
            Leyes ordenadas cronológicamente.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por ley, año o palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              style={styles.clearBtn}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros por categoría */}
        <div style={styles.filtros}>
          {categorias.map((cat) => (
            <button
              key={cat.valor}
              onClick={() => setCategoriaActiva(cat.valor)}
              style={{
                ...styles.filtroBtn,
                ...(categoriaActiva === cat.valor
                  ? styles.filtroBtnActivo
                  : {}),
              }}
            >
              {cat.etiqueta}
            </button>
          ))}
        </div>

        {/* Contador */}
        <p style={styles.contador}>
          Mostrando{" "}
          <strong>{leyesFiltradas.length}</strong> de {leyes.length} normas •{" "}
          <strong>{leidos.length}</strong> revisadas
        </p>

        {/* Sin resultados */}
        {leyesFiltradas.length === 0 && (
          <div style={styles.sinResultados}>
            <span style={{ fontSize: "2.5rem" }}>🔎</span>
            <p>No se encontraron normas con esa búsqueda.</p>
          </div>
        )}

        {/* Cards */}
        <div style={styles.grid}>
          {leyesFiltradas.map((ley) => {
            const estaAbierto = abiertos.includes(ley.id);
            const estaLeido = leidos.includes(ley.id);
            const estaCopiado = copiados.includes(ley.id);

            return (
              <div
                key={ley.id}
                style={{
                  ...styles.card,
                  ...(estaLeido ? styles.cardLeida : {}),
                  ...(estaAbierto ? styles.cardAbierta : {}),
                }}
              >
                {/* Cabecera clickeable */}
                <div
                  style={styles.cardHeader}
                  onClick={() => toggleAbierto(ley.id)}
                  role="button"
                  aria-expanded={estaAbierto}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && toggleAbierto(ley.id)
                  }
                >
                  {/* Badge de año */}
                  <span style={styles.añoBadge}>{ley.año}</span>

                  <div style={styles.cardHeaderCenter}>
                    <span style={styles.cardIcono}>{ley.icono}</span>
                    <div>
                      <p style={styles.cardTitulo}>{ley.titulo}</p>
                      <p style={styles.cardResumen}>{ley.resumen}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div
                    style={styles.acciones}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      style={{
                        ...styles.btnAccion,
                        ...(estaCopiado ? styles.btnCopiado : {}),
                      }}
                      onClick={(e) => copiarInfo(e, ley)}
                      title="Copiar información"
                    >
                      {estaCopiado ? "✓ Copiado" : "📋 Copiar"}
                    </button>
                    <button
                      style={{
                        ...styles.btnAccion,
                        ...(estaLeido ? styles.btnLeido : {}),
                      }}
                      onClick={(e) => toggleLeido(e, ley.id)}
                      title={estaLeido ? "Marcar como no leído" : "Marcar como leído"}
                    >
                      {estaLeido ? "✓ Leído" : "👁 Marcar"}
                    </button>
                    <span style={styles.chevron}>
                      {estaAbierto ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Cuerpo expandible */}
                {estaAbierto && (
                  <div style={styles.cardBody}>
                    <p style={styles.cardDetalle}>{ley.detalle}</p>
                    {ley.alerta && (
                      <div style={styles.alertaBox}>{ley.alerta}</div>
                    )}
                    <div style={styles.cardFooter}>
                      <span style={styles.categoriaTag}>
                        {
                          categorias.find((c) => c.valor === ley.categoria)
                            ?.etiqueta
                        }
                      </span>
                      <span style={styles.añoTag}>Año {ley.año}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ── Estilos inline (compatible con Next.js sin config extra) ───────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f8f9fc",
    color: "#334155",
  },
  sidebar: {
    width: 240,
    backgroundColor: "#1e293b",
    color: "white",
    padding: "30px 16px",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  navBrand: {
    fontWeight: 700,
    fontSize: "1.15rem",
    marginBottom: 36,
    letterSpacing: "-0.3px",
  },
  navLink: {
    display: "block",
    padding: "10px 14px",
    color: "#94a3b8",
    textDecoration: "none",
    borderRadius: 8,
    marginBottom: 4,
    fontSize: "0.88rem",
    transition: "background 0.2s",
  },
  navLinkActive: {
    backgroundColor: "#334155",
    color: "white",
  },
  main: {
    flex: 1,
    padding: "40px 44px",
    maxWidth: 920,
    margin: "0 auto",
    width: "100%",
  },
  header: {
    marginBottom: 28,
  },
  titulo: {
    fontSize: "1.85rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  subtitulo: {
    color: "#64748b",
    marginTop: 6,
    fontSize: "0.9rem",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1rem",
  },
  searchInput: {
    width: "100%",
    padding: "12px 40px 12px 44px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: "0.93rem",
    backgroundColor: "white",
    outline: "none",
    fontFamily: "inherit",
    color: "#334155",
    boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    fontSize: "0.9rem",
    padding: 4,
  },
  filtros: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 16,
  },
  filtroBtn: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#64748b",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  filtroBtnActivo: {
    backgroundColor: "#1e293b",
    color: "white",
    borderColor: "#1e293b",
  },
  contador: {
    fontSize: "0.82rem",
    color: "#94a3b8",
    marginBottom: 20,
  },
  sinResultados: {
    textAlign: "center" as const,
    padding: "50px 20px",
    color: "#94a3b8",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 12,
  },
  grid: {
    display: "grid",
    gap: 14,
  },
  card: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
    transition: "box-shadow 0.2s, border-color 0.2s",
  },
  cardLeida: {
    borderLeft: "4px solid #16a34a",
  },
  cardAbierta: {
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    padding: "18px 20px",
    cursor: "pointer",
    gap: 14,
    userSelect: "none" as const,
  },
  añoBadge: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    flexShrink: 0,
    letterSpacing: "0.5px",
  },
  cardHeaderCenter: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  cardIcono: {
    fontSize: "1.5rem",
    flexShrink: 0,
  },
  cardTitulo: {
    fontWeight: 600,
    fontSize: "0.92rem",
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.4,
  },
  cardResumen: {
    fontSize: "0.78rem",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  acciones: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  btnAccion: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "0.75rem",
    color: "#64748b",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s",
  },
  btnCopiado: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    borderColor: "#bbf7d0",
  },
  btnLeido: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    borderColor: "#bbf7d0",
  },
  chevron: {
    fontSize: "0.7rem",
    color: "#94a3b8",
  },
  cardBody: {
    padding: "0 20px 20px 20px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 16,
  },
  cardDetalle: {
    fontSize: "0.88rem",
    color: "#475569",
    lineHeight: 1.7,
    margin: 0,
  },
  alertaBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fef3c7",
    borderRadius: 8,
    padding: "12px 16px",
    marginTop: 14,
    color: "#92400e",
    fontSize: "0.82rem",
    fontWeight: 500,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  categoriaTag: {
    fontSize: "0.75rem",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    padding: "3px 10px",
    borderRadius: 20,
  },
  añoTag: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
};

 
