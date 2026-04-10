import { LeyData } from "@/types";

export const legalFrameworkData: LeyData[] = [
  {
    id: 1,
    year: 2002,
    icon: "🚦",
    title: "Ley 769 de 2002 – Código Nacional de Tránsito",
    summary: "Ley madre del tránsito en Colombia.",
    detail:
      "Define qué es un accidente de tránsito, las obligaciones de los conductores al momento del siniestro y las sanciones aplicables. Es la base legal sobre la que opera toda la gestión de choques en el país.",
    category: "traffic",
  },
  {
    id: 2,
    year: 2009,
    icon: "🗂️",
    title: "Resolución 3245 de 2009 – RUNT",
    summary: "Registro Único Nacional de Tránsito.",
    detail:
      "Crea el RUNT, el sistema oficial donde se registran todos los vehículos, conductores y accidentes del país. Una futura integración permitiría validar datos vehiculares en tiempo real.",
    category: "technology",
  },
  {
    id: 3,
    year: 2012,
    icon: "⚖️",
    title: "Código Civil – Art. 2341 – Responsabilidad Civil",
    summary: "Obligación de indemnizar daños causados a terceros.",
    detail:
      "Establece que quien cause un daño a otro está obligado a repararlo. Los reportes generados por esta app sirven como soporte técnico para negociar dicha indemnización de forma justa.",
    category: "civil",
  },
  {
    id: 4,
    year: 2012,
    icon: "🛡️",
    title: "Ley 1581 de 2012 – Protección de Datos",
    summary: "Regula el uso de tus datos e imágenes.",
    detail:
      "Tus fotos y datos vehiculares están protegidos. Solo se comparten con talleres aliados bajo tu autorización para fines de cotización y reparación.",
    category: "data",
  },
  {
    id: 5,
    year: 2015,
    icon: "📋",
    title: "Decreto 1079 de 2015 – Reglamentario del Transporte",
    summary: "Norma todo el sector transporte en Colombia.",
    detail:
      "Compila toda la reglamentación del sector transporte: revisión técnico-mecánica, seguros mínimos para circular y procedimientos ante accidentes.",
    category: "traffic",
  },
  {
    id: 6,
    year: 2017,
    icon: "📸",
    title: "Ley 1843 de 2017 – Evidencia Digital en Tránsito",
    summary: "Fotografías como evidencia legal válida.",
    detail:
      "Regula el uso de medios tecnológicos para el control del tránsito. Las fotos tomadas en la app tienen valor probatorio y pueden usarse en conciliaciones o procesos legales.",
    alert: "📌 Las fotos deben incluir metadatos de fecha, hora y ubicación.",
    category: "technology",
  },
  {
    id: 7,
    year: 2022,
    icon: "🚗",
    title: "Ley 2251 de 2022 – Choques Simples",
    summary: "Retiro inmediato del vehículo tras un choque leve.",
    detail:
      "En accidentes con solo daños materiales, los vehículos deben retirarse de la vía de inmediato. Esta app permite documentar los daños antes de mover los vehículos, cumpliendo la ley.",
    alert: "⚠️ No retirar el vehículo puede acarrear una multa de tránsito.",
    category: "traffic",
  },
  {
    id: 8,
    year: 2022,
    icon: "📜",
    title: "SOAT – ¿Qué cubre?",
    summary: "Solo daños corporales, NO daños materiales.",
    detail:
      "El SOAT cubre gastos médicos, hospitalización e incapacidad. No cubre daños a la carrocería. Para eso se necesita conciliación directa o un seguro Todo Riesgo.",
    alert: "💡 Esta app cotiza los daños materiales que el SOAT NO cubre.",
    category: "insurance",
  },
];

export const legalCategories = [
  { value: "all", label: "Todas" },
  { value: "traffic", label: "🚦 Tráfico" },
  { value: "civil", label: "⚖️ Civil" },
  { value: "insurance", label: "🛡️ Seguros" },
  { value: "data", label: "🔒 Datos" },
  { value: "technology", label: "💻 Tecnología" },
];