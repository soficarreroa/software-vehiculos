"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CotizacionPage.module.css';
import Button from '@/app/components/ui/Button/Button';
import Info from '@/app/components/ui/Info/Info';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { authenticatedFetch, readApiError } from '@/app/lib/api/client';
import { getAuthenticatedVehicles, type Vehicle } from '@/app/lib/api/vehicles';
import type { HallazgoFoto, ResultadoAgregar } from '@/app/types/cotizacionResultado';
import AnalisisFoto from './Resultados/AnalisisFoto';
import { buscarPiezaCatalogo as buscarPieza, cuantasCoinciden, etiquetaPresupuesto } from './Resultados/ResultadoCotizacion.utils';

// Configuración de etiquetas: label (visual), emoji (interfaz), valor (base de datos)
const ETIQUETAS_DANOS = [
  { label: "Rayón", emoji: "🖍️", valor: "Rayon" },
  { label: "Abolladura", emoji: "🔨", valor: "Abolladura" },
  { label: "Rotura", emoji: "💥", valor: "Rotura" },
  { label: "Pintura", emoji: "🎨", valor: "Pintura" },
  { label: "Falta pieza", emoji: "🔍", valor: "Falta pieza" }
];

interface Pieza {
  id: number;
  nombre: string;
  precio_repuesto: number;
  precio_mano_obra: number;
  precio_pintura: number;
  moneda: string;
}

interface ItemSeleccionado {
  pieza_id: number;
  nombre: string;
  cantidad: number;
  descripcion: string;
}

const PIEZAS_VACIAS: Pieza[] = [];

interface CotizacionGuardada {
  id: number | null;
  total: number;
  piezas: number;
  vehiculo: Vehicle;
}

export default function CotizacionPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [intentoPiezas, setIntentoPiezas] = useState(0);
  const [resultadoPiezas, setResultadoPiezas] = useState<{ clave: string; data: Pieza[]; error: string | null } | null>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | 'Selected'>('Selected');
  // Piezas del vehículo elegido. Todo es derivado: sin vehículo no hay piezas, y mientras llega la respuesta se está cargando
  const clavePiezas = typeof selectedVehicleId === 'number' ? `${selectedVehicleId}-${intentoPiezas}` : null;
  const piezasListas = resultadoPiezas && resultadoPiezas.clave === clavePiezas ? resultadoPiezas : null;
  const piezasDisponibles = piezasListas?.data ?? PIEZAS_VACIAS;
  const cargandoPiezas = clavePiezas !== null && piezasListas === null;
  const errorPiezas = piezasListas?.error ?? null;
  const [observaciones, setObservaciones] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState(new Date().toISOString().split('T')[0]);
  
  const [items, setItems] = useState<ItemSeleccionado[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success'; texto: string } | null>(null);
  const [guardada, setGuardada] = useState<CotizacionGuardada | null>(null);

  // 1. Cargar vehículos
  useEffect(() => {
    let activo = true;
    getAuthenticatedVehicles()
      .then((data: Vehicle[]) => {
        if (activo) setVehicles(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (activo) console.error("Error cargando vehículos:", err);
      });
    return () => {
      activo = false;
    };
  }, []);

  // 2. Cargar piezas por vehículo
  useEffect(() => {
    if (clavePiezas === null || typeof selectedVehicleId !== 'number') return;
    let activo = true;
    authenticatedFetch(`/api/v1/vehiculos/${selectedVehicleId}/piezas-disponibles`)
      .then(async (res) => {
        if (!res.ok) throw await readApiError(res, 'No se pudieron cargar las piezas disponibles.');
        return res.json();
      })
      .then((data: Pieza[]) => {
        if (activo) setResultadoPiezas({ clave: clavePiezas, data: Array.isArray(data) ? data : [], error: null });
      })
      .catch((err: unknown) => {
        if (!activo) return;
        console.error("Error cargando piezas:", err);
        const texto = err instanceof Error ? err.message : 'No se pudieron cargar las piezas disponibles.';
        setResultadoPiezas({ clave: clavePiezas, data: [], error: texto });
      });
    return () => {
      activo = false;
    };
  }, [clavePiezas, selectedVehicleId]);

  const agregarPieza = (piezaId: string) => {
    if (!piezaId) return;
    const pieza = piezasDisponibles.find(p => p.id === parseInt(piezaId));
    if (pieza) {
      if (items.some(i => i.pieza_id === pieza.id)) {
        setMensaje({ tipo: 'error', texto: `«${pieza.nombre}» ya está en la cotización. Cambia su cantidad si necesitas más de una.` });
        return;
      }
      setMensaje(null);
      setGuardada(null);
      setItems([...items, {
        pieza_id: pieza.id,
        nombre: pieza.nombre,
        cantidad: 1,
        descripcion: "" // Inicia vacío para la base de datos
      }]);
    }
  };

  const buscarPiezaCatalogo = (nombre: string): Pieza | undefined =>
    buscarPieza(nombre, piezasDisponibles);

  // Pasa al presupuesto las piezas confirmadas en el análisis con foto
  const agregarDesdeFoto = (hallazgos: HallazgoFoto[]): ResultadoAgregar => {
    const agregadas: string[] = [];
    const sinCatalogo: string[] = [];
    const ambiguas: string[] = [];
    let siguiente = [...items];

    for (const { pieza: nombre, tipos } of hallazgos) {
      const pieza = buscarPiezaCatalogo(nombre);
      if (!pieza) {
        (cuantasCoinciden(nombre, piezasDisponibles) > 1 ? ambiguas : sinCatalogo).push(nombre);
        continue;
      }
      const etiquetas = [...new Set(tipos.map(etiquetaPresupuesto).filter((e): e is string => e !== null))];
      const existente = siguiente.findIndex(i => i.pieza_id === pieza.id);

      if (existente >= 0) {
        const actuales = siguiente[existente].descripcion
          ? siguiente[existente].descripcion.split(', ').filter(t => t.trim() !== '')
          : [];
        const unidas = [...new Set([...actuales, ...etiquetas])].join(', ');
        siguiente = siguiente.map((i, idx) => (idx === existente ? { ...i, descripcion: unidas } : i));
      } else {
        siguiente.push({
          pieza_id: pieza.id,
          nombre: pieza.nombre,
          cantidad: 1,
          descripcion: etiquetas.join(', '),
        });
      }
      agregadas.push(pieza.nombre);
    }

    setItems(siguiente);
    setMensaje(null);
    setGuardada(null);
    return { agregadas, sinCatalogo, ambiguas };
  };

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Función para manejar etiquetas SIN emojis para la DB
  const toggleEtiqueta = (index: number, valorEtiqueta: string) => {
    const newItems = [...items];
    const desc = newItems[index].descripcion;

    // Convertimos la descripción en un array para manipularla mejor
    let etiquetasActivas = desc ? desc.split(', ').filter(tag => tag.trim() !== "") : [];

    if (etiquetasActivas.includes(valorEtiqueta)) {
      // Si ya está, la removemos
      etiquetasActivas = etiquetasActivas.filter(tag => tag !== valorEtiqueta);
    } else {
      // Si no está, la agregamos
      etiquetasActivas.push(valorEtiqueta);
    }

    // Unimos de nuevo con coma y espacio
    newItems[index].descripcion = etiquetasActivas.join(', ');
    setItems(newItems);
  };


const precioUnitario = (piezaId: number): number => {
  const info = piezasDisponibles.find(p => p.id === piezaId);
  return (info?.precio_repuesto ?? 0) + (info?.precio_mano_obra ?? 0) + (info?.precio_pintura ?? 0);
};
const totalItems = items.reduce((suma, i) => suma + precioUnitario(i.pieza_id) * i.cantidad, 0);

const generarPDF = (vehiculo: Vehicle) => {
  const doc = new jsPDF();
  let granTotal = 0;

  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(33, 47, 61);
  doc.text("PRESUPUESTO DE REPARACIÓN", 105, 20, { align: "center" });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);

  // Datos del Vehículo
  doc.setFontSize(10);
  doc.text(`Vehículo: ${vehiculo.marca} ${vehiculo.modelo}`, 20, 35);
  doc.text(`Placa: ${vehiculo.placa.toUpperCase()}`, 20, 41);
  doc.text(`Fecha: ${fechaIncidente}`, 150, 35);

  // Mapear filas y calcular totales
  const tableRows = items.map(item => {
    // Buscamos la info de precios original de la pieza desde piezasDisponibles
    const infoPrecio = piezasDisponibles.find(p => p.id === item.pieza_id);
    
    const repuesto = infoPrecio?.precio_repuesto || 0;
    const obra = infoPrecio?.precio_mano_obra || 0;
    const pintura = infoPrecio?.precio_pintura || 0;
    const subtotal = (repuesto + obra + pintura) * item.cantidad;
    
    granTotal += subtotal;

    return [
      item.nombre,
      item.descripcion || "Normal",
      `$${repuesto.toLocaleString()}`,
      `$${obra.toLocaleString()}`,
      `$${pintura.toLocaleString()}`,
      `$${subtotal.toLocaleString()}`
    ];
  });

  // Generar Tabla
  autoTable(doc, {
    startY: 50,
    head: [['Pieza', 'Detalle', 'Repuesto', 'M. Obra', 'Pintura', 'Subtotal']],
    body: tableRows,
    headStyles: { fillColor: [40, 167, 69] },
    styles: { fontSize: 8 },
    columnStyles: {
      5: { halign: 'right', fontStyle: 'bold' } // Subtotal alineado a la derecha
    }
  });

  // Resumen de Totales
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL ESTIMADO (COP) : `, 110 , finalY + 7);
  doc.text(`$${granTotal.toLocaleString()}`, 190, finalY + 7, { align: "right" });

  // Cuadro de firmas o notas legales
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const notaLegal = "Este presupuesto es una estimación basada en los precios vigentes de catálogo. Los valores finales pueden variar tras el desarmado del vehículo.";
  doc.text(notaLegal, 20, finalY + 20, { maxWidth: 170 });

  doc.save(`Presupuesto_${vehiculo.placa}.pdf`);
};


const enviarCotizacion = async () => {
  setMensaje(null);
  if (typeof selectedVehicleId !== 'number') {
    setMensaje({ tipo: 'error', texto: 'Selecciona primero el vehículo en «1. Datos del siniestro».' });
    return;
  }
  if (items.length === 0) {
    setMensaje({ tipo: 'error', texto: 'Agrega al menos una pieza en «2. Detalle de piezas» (o pásalas desde el análisis con foto).' });
    return;
  }

  setLoading(true);
  const payload = {
    vehiculo_id: selectedVehicleId,
    fecha_incidente: fechaIncidente,
    observaciones: observaciones,
    items: items.map(i => ({
      pieza_id: i.pieza_id,
      cantidad: i.cantidad,
      descripcion: i.descripcion || "Sin descripción específica"
    }))
  };

  try {
    const response = await authenticatedFetch('/api/v1/cotizaciones/completa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const respuesta = (await response.json().catch(() => null)) as { id?: number; monto_total?: number } | null;
      const vehiculoActual = vehicles.find(v => v.id === selectedVehicleId);
      if (vehiculoActual) {
        generarPDF(vehiculoActual);
        setGuardada({
          id: respuesta?.id ?? null,
          total: respuesta?.monto_total ?? totalItems,
          piezas: items.length,
          vehiculo: vehiculoActual,
        });
      }
      setItems([]);
      setObservaciones("");
    } else {
      const apiError = await readApiError(
        response,
        response.status === 404
          ? "El vehículo no existe o no pertenece al usuario actual."
          : response.status === 422
            ? "Revisa los datos de la cotización."
            : "Error al procesar la cotización en el servidor",
      );
      setMensaje({ tipo: 'error', texto: apiError.message });
    }
  } catch (error) {
    console.error("Error conexión API:", error);
    setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor. Revisa que el backend esté en marcha e inténtalo de nuevo.' });
  } finally {
    setLoading(false);
  }
};

const cambiarCantidad = (index: number, valor: string) => {
  const n = Math.max(1, Math.min(99, parseInt(valor, 10) || 1));
  setItems(items.map((it, i) => (i === index ? { ...it, cantidad: n } : it)));
};

const formatoCop = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📝 Generador de Cotizaciones</h1>
        <p>Selecciona un vehículo y las piezas afectadas para el reporte.</p>
      </header>

      <AnalisisFoto
        vehiculoId={typeof selectedVehicleId === 'number' ? selectedVehicleId : null}
        catalogo={piezasDisponibles}
        onAgregarAlPresupuesto={agregarDesdeFoto}
      />

      <div className={styles.grid} id="seccion-cotizacion">
        {/* LADO IZQUIERDO: Info General */}
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>1. Datos del Siniestro</h2>
          
          <div className={styles.formGroup}>
            <label>Vehículo</label>
            <select 
              className={styles.select}
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value === 'Selected' ? 'Selected' : parseInt(e.target.value))}
            >
              <option value="Selected">-- Selecciona tu auto --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Fecha del evento</label>
            <input 
              type="date" 
              className={styles.input} 
              value={fechaIncidente}
              onChange={(e) => setFechaIncidente(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notas Generales</label>
            <textarea 
              className={styles.textarea}
              placeholder="Ej: El golpe fue lateral..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {/* LADO DERECHO: Piezas y Daños */}
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>2. Detalle de Piezas</h2>
          
          <div className={styles.formGroup}>
            <label>Buscar Pieza</label>
            <select
              className={styles.select}
              disabled={cargandoPiezas || piezasDisponibles.length === 0}
              onChange={(e) => {
                agregarPieza(e.target.value);
                e.target.value = "";
              }}
              value=""
            >
              <option value="">
                {typeof selectedVehicleId !== 'number'
                  ? '-- Primero selecciona un vehículo --'
                  : cargandoPiezas
                    ? 'Cargando piezas…'
                    : piezasDisponibles.length === 0
                      ? '-- Sin piezas disponibles --'
                      : '-- Añadir pieza afectada --'}
              </option>
              {piezasDisponibles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {typeof selectedVehicleId !== 'number' && (
              <p className={styles.hint}>Elige el vehículo en «1. Datos del siniestro» para ver sus piezas.</p>
            )}
            {errorPiezas && (
              <Info severity="error">
                {errorPiezas}{' '}
                <button type="button" className={styles.btnLink} onClick={() => setIntentoPiezas(n => n + 1)}>
                  Reintentar
                </button>
              </Info>
            )}
            {!errorPiezas && !cargandoPiezas && typeof selectedVehicleId === 'number' && piezasDisponibles.length === 0 && (
              <Info severity="warning">
                Este vehículo no tiene piezas con precio en el catálogo. Pide que carguen el catálogo de precios (tabla catalogo_precios).
              </Info>
            )}
          </div>

          <div className={styles.listContainer}>
            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <p>⚠️ Selecciona piezas para cotizar.</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <strong>⚙️ {item.nombre}</strong>
                    <label className={styles.cantidad}>
                      Cant.
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.cantidad}
                        onChange={(e) => cambiarCantidad(index, e.target.value)}
                        className={styles.inputCantidad}
                      />
                    </label>
                    <span className={styles.precioItem}>{formatoCop(precioUnitario(item.pieza_id) * item.cantidad)}</span>
                    <button onClick={() => eliminarItem(index)} className={styles.btnDelete}>
                      Remover
                    </button>
                  </div>

                  <div className={styles.tagSection}>
                    <p className={styles.smallLabel}>Daños identificados:</p>
                    <div className={styles.tagsGrid}>
                      {ETIQUETAS_DANOS.map(tag => (
                        <button
                          key={tag.valor}
                          type="button"
                          className={`${styles.tagButton} ${item.descripcion.includes(tag.valor) ? styles.tagActive : ""}`}
                          onClick={() => toggleEtiqueta(index, tag.valor)}
                        >
                          {tag.emoji} {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Escribir más detalles..." 
                    value={item.descripcion}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].descripcion = e.target.value;
                      setItems(newItems);
                    }}
                    className={styles.input}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <section className={styles.resumenFinal} aria-live="polite">
        {items.length > 0 && (
          <p className={styles.totalLinea}>
            {items.length} {items.length === 1 ? 'pieza' : 'piezas'} · Total estimado: <strong>{formatoCop(totalItems)}</strong>
          </p>
        )}
        {mensaje && <Info severity={mensaje.tipo}>{mensaje.texto}</Info>}
        {guardada && (
          <Info severity="success">
            Cotización{guardada.id ? ` #${guardada.id}` : ''} guardada para {guardada.vehiculo.marca} {guardada.vehiculo.modelo}
            {' '}({guardada.piezas} {guardada.piezas === 1 ? 'pieza' : 'piezas'}, total {formatoCop(guardada.total)}). El PDF se descargó
            automáticamente. <Link href="/historial" className={styles.btnLink}>Ver en mi historial</Link>
          </Info>
        )}
      </section>

      <footer className={styles.actions}>
        <Button
          color="green"
          onClick={enviarCotizacion}
          disabled={loading}
        >
          {loading ? "Guardando…" : "Finalizar cotización y descargar PDF"}
        </Button>
      </footer>
    </div>
  );
}