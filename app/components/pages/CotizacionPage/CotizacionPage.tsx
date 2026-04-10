"use client";

import { useState, useEffect } from 'react';
import styles from './CotizacionPage.module.css';
import Button from '@/app/components/ui/Button/Button';

// Interfaces basadas en tu esquema SQL
interface Vehicle {
  id: number;
  name: string; // marca + modelo
  plate: string;
}

interface StoredVehicle {
  id: number;
  name: string;
  model: string;
  plate: string;
}


export default function CotizacionPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState(new Date().toISOString().split('T')[0]);

  // 1. Cargar vehículos del usuario (Simulando SELECT * FROM vehiculos WHERE usuario_id = ...)
  useEffect(() => {
    const saved = localStorage.getItem('autoPerito_vehicles');
    if (saved) {
      try {
        const parsed: StoredVehicle[] = JSON.parse(saved);
        // Mapeamos al formato de la tabla SQL
        const formatted = parsed.map((v: StoredVehicle) => ({
          id: v.id,
          name: `${v.name} (${v.model})`,
          plate: v.plate
        }));
        // eslint-disable-next-line
        setVehicles(formatted);
      } catch (e) {
        console.error("Error cargando vehículos", e);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Nueva Cotización</h1>
        <p>Completa los datos del incidente para generar el presupuesto.</p>
      </header>

      <div className={styles.grid}>
        {/* SECCIÓN 1: Información General (Tabla: cotizaciones) */}
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>1. Información del Vehículo</h2>
          
          <div className={styles.formGroup}>
            <label>Selecciona tu vehículo registrado</label>
            <select 
              className={styles.select}
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Fecha del Incidente</label>
            <input 
              type="date" 
              className={styles.input} 
              value={fechaIncidente}
              onChange={(e) => setFechaIncidente(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Observaciones iniciales</label>
            <textarea 
              className={styles.textarea}
              placeholder="Describe brevemente lo ocurrido..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {/* SECCIÓN 2: Piezas (Aquí irán los items_cotizacion) */}
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>2. Piezas y Daños</h2>
          <div className={styles.emptyItems}>
            <p>Aún no has agregado piezas a la cotización.</p>
            <Button color="green">+ Agregar Pieza</Button>
          </div>
        </div>
      </div>

      <footer className={styles.actions}>
        <Button color="green" disabled={!selectedVehicleId}>
          Generar Borrador de Cotización
        </Button>
      </footer>
    </div>
  );
}