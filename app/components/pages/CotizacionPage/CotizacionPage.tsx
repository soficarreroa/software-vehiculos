"use client";

import { useState, useEffect } from 'react';
import styles from './CotizacionPage.module.css';
import Button from '@/app/components/ui/Button/Button';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuración de etiquetas: label (visual), emoji (interfaz), valor (base de datos)
const ETIQUETAS_DANOS = [
  { label: "Rayón", emoji: "🖍️", valor: "Rayon" },
  { label: "Abolladura", emoji: "🔨", valor: "Abolladura" },
  { label: "Rotura", emoji: "💥", valor: "Rotura" },
  { label: "Pintura", emoji: "🎨", valor: "Pintura" },
  { label: "Falta pieza", emoji: "🔍", valor: "Falta pieza" }
];

interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
}

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

export default function CotizacionPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [piezasDisponibles, setPiezasDisponibles] = useState<Pieza[]>([]);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | 'Selected'>('Selected');
  const [observaciones, setObservaciones] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState(new Date().toISOString().split('T')[0]);
  
  const [items, setItems] = useState<ItemSeleccionado[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "https://software-vehiculos-api.onrender.com/api/v1";

  // 1. Cargar vehículos
  useEffect(() => {
    fetch(`${API_BASE_URL}/vehiculos`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error("Error cargando vehículos:", err));
  }, []);

  // 2. Cargar piezas por vehículo
  useEffect(() => {
    if (typeof selectedVehicleId === 'number') {
      fetch(`${API_BASE_URL}/vehiculos/${selectedVehicleId}/piezas-disponibles`)
        .then(res => res.json())
        .then(data => setPiezasDisponibles(data))
        .catch(err => console.error("Error cargando piezas:", err));
    } else {
      setPiezasDisponibles([]);
    }
  }, [selectedVehicleId]);

  const agregarPieza = (piezaId: string) => {
    if (!piezaId) return;
    const pieza = piezasDisponibles.find(p => p.id === parseInt(piezaId));
    if (pieza) {
      setItems([...items, {
        pieza_id: pieza.id,
        nombre: pieza.nombre,
        cantidad: 1,
        descripcion: "" // Inicia vacío para la base de datos
      }]);
    }
  };

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Función para manejar etiquetas SIN emojis para la DB
  const toggleEtiqueta = (index: number, valorEtiqueta: string) => {
    const newItems = [...items];
    let desc = newItems[index].descripcion;

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
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
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
  if (typeof selectedVehicleId !== 'number' || items.length === 0) return;

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
    const response = await fetch(`${API_BASE_URL}/cotizaciones/completa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // 1. Buscamos los datos del vehículo para el PDF
      const vehiculoActual = vehicles.find(v => v.id === selectedVehicleId);
      
      // 2. Generamos el PDF si encontramos el vehículo
      if (vehiculoActual) {
        generarPDF(vehiculoActual);
      }

      // 3. Notificamos al usuario
      alert("✅ Cotización guardada y PDF generado correctamente");

      // 4. Limpiamos el formulario
      setItems([]);
      setObservaciones("");
      // Opcional: podrías resetear el vehículo seleccionado si lo deseas
      // setSelectedVehicleId('Selected'); 
      
    } else {
      alert("❌ Error al procesar la cotización en el servidor");
    }
  } catch (error) {
    console.error("Error conexión API:", error);
    alert("❌ Error crítico: No se pudo conectar con el servidor");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📝 Generador de Cotizaciones</h1>
        <p>Selecciona un vehículo y las piezas afectadas para el reporte.</p>
      </header>

      <div className={styles.grid}>
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
              disabled={!piezasDisponibles.length}
              onChange={(e) => {
                agregarPieza(e.target.value);
                e.target.value = "";
              }}
              value=""
            >
              <option value="">-- Añadir pieza afectada --</option>
              {piezasDisponibles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
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

      <footer className={styles.actions}>
        <Button 
          color="green" 
          onClick={enviarCotizacion} 
          disabled={loading || items.length === 0}
        >
          {loading ? "Enviando..." : "Finalizar Cotización"}
        </Button>
      </footer>
    </div>
  );
}