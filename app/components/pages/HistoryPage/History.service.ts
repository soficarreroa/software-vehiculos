import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umpkwpurnujoebzjglzs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcGt3cHVybnVqb2ViempnbHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTQ5NTMsImV4cCI6MjA5MTIzMDk1M30.vhHL0H8C1-UfLFMs1NBJDXUmHllZl-DqJ_0sUCrC47U'
);

export interface HistoryEntry {
  id: number;
  fecha: string;
  descripcion_siniestro: string;
  vehiculo_nombre: string;
  placa: string;
  valor_total: number;
  estado: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const historyService = {
  async getHistorial(userId: string): Promise<HistoryEntry[]> {
    try {
      console.log('Buscando cotizaciones para usuario:', userId);
      
      const { data: cotizaciones, error: cotizacionesError } = await supabase
        .from('cotizaciones')
        .select('id, creado_en, observaciones, estado, vehiculo_id, monto_total')
        .eq('usuario_id', parseInt(userId))
        .order('creado_en', { ascending: false });
      
      if (cotizacionesError) {
        console.error('Error al obtener cotizaciones:', cotizacionesError);
        throw new Error(cotizacionesError.message);
      }
      
      if (!cotizaciones || cotizaciones.length === 0) {
        console.log('No hay cotizaciones');
        return [];
      }
      
      console.log('Encontradas', cotizaciones.length, 'cotizaciones');
      
      const vehiculoIds = [...new Set(cotizaciones.map(c => c.vehiculo_id).filter(id => id))];
      
      let vehiculosMap = new Map();
      if (vehiculoIds.length > 0) {
        const { data: vehiculos, error: vehiculosError } = await supabase
          .from('vehiculos')
          .select('id, marca, modelo, placa')
          .in('id', vehiculoIds);
        
        if (vehiculosError) {
          console.error('Error al obtener vehiculos:', vehiculosError);
        } else if (vehiculos) {
          vehiculos.forEach(v => {
            vehiculosMap.set(v.id, v);
          });
          console.log('Encontrados', vehiculos.length, 'vehiculos');
        }
      }
      
      // Cálculo de totales por si acaso, pero el backend ya lo provee
      const cotizacionIds = cotizaciones.map(c => c.id);
      let itemsMap = new Map();
      
      if (cotizacionIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('items_cotizacion')
          .select('cotizacion_id, precio_unit_repuesto, precio_unit_mano_obra, precio_unit_pintura')
          .in('cotizacion_id', cotizacionIds);
        
        if (itemsError) {
          console.error('Error al obtener items:', itemsError);
        } else if (items) {
          items.forEach(item => {
            const currentTotal = itemsMap.get(item.cotizacion_id) || 0;
            const repuesto = Number(item.precio_unit_repuesto) || 0;
            const manoObra = Number(item.precio_unit_mano_obra) || 0;
            const pintura = Number(item.precio_unit_pintura) || 0;
            itemsMap.set(item.cotizacion_id, currentTotal + repuesto + manoObra + pintura);
          });
          console.log('Calculados totales para', itemsMap.size, 'cotizaciones');
        }
      }
      
      const history: HistoryEntry[] = cotizaciones.map(item => {
        const vehiculo = vehiculosMap.get(item.vehiculo_id);
        
        let vehiculoNombre = 'Vehiculo no especificado';
        let placaVehiculo = 'Por consultar';
        
        if (vehiculo) {
          const marca = vehiculo.marca || '';
          const modelo = vehiculo.modelo || '';
          vehiculoNombre = `${marca} ${modelo}`.trim();
          if (!vehiculoNombre) {
            vehiculoNombre = 'Vehiculo sin marca/modelo';
          }
          placaVehiculo = vehiculo.placa || 'Por consultar';
        }
        
        let montoTotal = itemsMap.get(item.id) || 0;
        if (montoTotal === 0 && item.monto_total) {
          montoTotal = Number(item.monto_total);
        }
        
        // El estado ya viene formateado desde el backend, pero mantenemos consistencia
        let estadoFormateado = 'En espera';
        const estadoOriginal = (item.estado || '').toLowerCase();
        if (estadoOriginal === 'reparado') {
          estadoFormateado = 'Reparado';
        } else if (estadoOriginal === 'cancelado') {
          estadoFormateado = 'Cancelado';
        }
        
        return {
          id: item.id,
          fecha: item.creado_en,
          descripcion_siniestro: item.observaciones || 'Sin descripcion',
          vehiculo_nombre: vehiculoNombre,
          placa: placaVehiculo,
          valor_total: montoTotal,
          estado: estadoFormateado
        };
      });
      
      console.log('Retornando', history.length, 'registros formateados');
      return history;
      
    } catch (error) {
      console.error('Error en getHistorial:', error);
      return [];
    }
  },

  async downloadReportPdf(cotizacionId: number, userId: string): Promise<void> {
  try {
    const url = `${API_URL}/api/v1/historial/${cotizacionId}/descargar-pdf?user_id=${userId}`;
    console.log('Solicitando PDF a:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    console.log(' Respuesta status:', response.status);

      if (!response.ok) {
        let errorMsg = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {
          const text = await response.text();
          errorMsg = text.substring(0, 200);
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.text();
        console.error(' Respuesta no es PDF:', text.substring(0, 500));
        throw new Error('El servidor no devolvió un archivo PDF válido');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('El PDF generado está vacío');
      }

      // Crear link de descarga
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `reporte_${cotizacionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      console.log(' Descarga exitosa');
      
    } catch (error) {
      console.error(' Error en downloadReportPdf:', error);
      // Lanza el error para que el componente lo maneje
      throw error;
    }
  }
};