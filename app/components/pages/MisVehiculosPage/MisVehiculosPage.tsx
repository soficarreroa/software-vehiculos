"use client";

import { useState, useEffect } from 'react';
import styles from './MisVehiculosPage.module.css'; // Asegúrate de que el nombre coincida con tu archivo CSS
import { VehicleCard } from './VehicleCard';
import { VehicleForm } from './VehicleForm';

// Definición de la interfaz del Vehículo
interface Vehicle {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  creado_en?: string;
}

export default function MyVehiclesPage() {
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const API_BASE_URL = 'http://localhost:8000/api/v1/vehiculos';

  // Función para cargar vehículos desde la API
  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setMyVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar vehículos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  // Función para guardar vehículo con VALIDACIÓN DE PLACA
  const guardarVehiculo = async (marca: string, modelo: string, color: string, placa: string) => {
    // 1. Validación de Placa (6 caracteres y mayúsculas)
    const placaNormalizada = placa.trim().toUpperCase();
    
    if (placaNormalizada.length !== 6) {
      setError("❌ La placa debe tener exactamente 6 caracteres (ej: AAA123)");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const vehicleData = { marca, modelo, color, placa: placaNormalizada };
      setError(null); // Limpiar errores previos

      if (editingVehicle) {
        // Actualizar vehículo
        const response = await fetch(`${API_BASE_URL}/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });

        if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);
      } else {
        // Crear nuevo vehículo
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });

        if (!response.ok) {
          const errorMsg = await response.json();
          throw new Error(errorMsg.detail || "Error al crear el vehículo");
        }
      }

      await fetchVehiculos();
      cerrarFormulario();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar vehículo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

const eliminarVehiculo = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este vehículo?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Si el error es 500 o 400, probablemente es por la llave foránea
        if (response.status === 500 || response.status === 409) {
          throw new Error("No puedes borrar este vehículo porque ya tiene cotizaciones o procesos asociados.");
        }
        throw new Error(`Error al eliminar: ${response.status}`);
      }

      // Si todo sale bien, recargamos la lista
      await fetchVehiculos();
      setError(null); // Limpiamos cualquier error previo
    } catch (err) {
      // Aquí capturamos el mensaje que escribimos arriba
      const mensajeAmigable = err instanceof Error ? err.message : 'Error al eliminar vehículo';
      setError(`⚠️ ${mensajeAmigable}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prepararEdicion = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>🚗 Mis Vehículos</h1>
          <p className={styles.subtitle}>Gestiona tus vehículos para generar cotizaciones rápidas.</p>
        </div>
        <button className={styles.btnAdd} onClick={() => setShowForm(true)}>
          + Añadir Vehículo
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => setError(null)} className={styles.closeError}>✕</button>
        </div>
      )}

      {showForm && (
        <VehicleForm
          key={editingVehicle ? `edit-${editingVehicle.id}` : 'new-vehicle'}
          onAdd={guardarVehiculo}
          onCancel={cerrarFormulario}
          initialData={editingVehicle || undefined}
          isEditing={!!editingVehicle}
        />
      )}

      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.loadingState}><p>Cargando vehículos...</p></div>
        ) : myVehicles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay vehículos registrados. ¡Agrega el primero!</p>
          </div>
        ) : (
          myVehicles.map((vehicle) => (
            <div key={vehicle.id} className={styles.cardWrapper}>
              <VehicleCard
                {...vehicle}
                onEdit={() => prepararEdicion(vehicle)}
                onDelete={() => eliminarVehiculo(vehicle.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}