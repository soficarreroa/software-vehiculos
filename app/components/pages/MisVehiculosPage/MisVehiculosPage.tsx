"use client";

import { useState, useEffect } from 'react';
import styles from './MisVehiculosPage.module.css'; // Asegúrate de que el nombre coincida con tu archivo CSS
import { VehicleCard } from './VehicleCard';
import { VehicleForm } from './VehicleForm';
import { authenticatedFetch, readApiError } from '@/app/lib/api/client';
import {
  getAuthenticatedVehicles,
  invalidateVehiclesCache,
  type Vehicle,
} from '@/app/lib/api/vehicles';

// Definición de la interfaz del Vehículo
export default function MyVehiclesPage() {
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const API_BASE_PATH = '/api/v1/vehiculos';

  // Función para cargar vehículos desde la API
  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const vehicles = await getAuthenticatedVehicles();
      setMyVehicles(vehicles);
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
        const response = await authenticatedFetch(`${API_BASE_PATH}/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });

        if (!response.ok) {
          throw await readApiError(response, response.status === 404
            ? 'Vehículo no encontrado o no pertenece al usuario actual.'
            : 'No se pudo actualizar el vehículo.');
        }
      } else {
        // Crear nuevo vehículo
        const response = await authenticatedFetch(API_BASE_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData),
        });

        if (!response.ok) {
          throw await readApiError(response, 'No se pudo crear el vehículo.');
        }
      }

      invalidateVehiclesCache();
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
      const response = await authenticatedFetch(`${API_BASE_PATH}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Vehículo no encontrado o no pertenece al usuario actual.");
        }
        if (response.status === 500 || response.status === 409) {
          throw new Error("No puedes borrar este vehículo porque ya tiene cotizaciones o procesos asociados.");
        }
        throw await readApiError(response, "No se pudo eliminar el vehículo.");
      }

      // Si todo sale bien, recargamos la lista
      invalidateVehiclesCache();
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