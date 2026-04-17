import { createClient } from '@supabase/supabase-js';

// Conexión directa a Supabase (valores fijos)
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

export const historyService = {
  async getHistorial(userId: string): Promise<HistoryEntry[]> {
    try {
      console.log('🔍 Buscando cotizaciones...');
      
      // Obtener todas las cotizaciones
      const { data: cotizaciones, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('usuario_id', parseInt(userId))
        .order('creado_en', { ascending: false });
      
      if (error) {
        console.error('❌ Error:', error);
        throw new Error(error.message);
      }
      
      if (!cotizaciones || cotizaciones.length === 0) {
        console.log('📭 No hay cotizaciones');
        return [];
      }
      
      console.log(`✅ Encontradas ${cotizaciones.length} cotizaciones`);
      
      // Mapear directamente los datos
      const history: HistoryEntry[] = cotizaciones.map(item => ({
        id: item.id,
        fecha: item.creado_en,
        descripcion_siniestro: item.observaciones || 'Sin descripción',
        vehiculo_nombre: `Vehículo ID: ${item.vehiculo_id || 'N/A'}`,
        placa: 'Por consultar',
        valor_total: parseFloat(item.monito_total) || 0,
        estado: item.estado === 'reparado' ? 'Reparado' : 'En espera'
      }));
      
      return history;
      
    } catch (error) {
      console.error(' Error:', error);
      return [];
    }
  },

  async downloadReportPdf(cotizacionId: number, userId: string): Promise<void> {
    try {
      // Obtener la cotización específica
      const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', cotizacionId)
        .eq('usuario_id', parseInt(userId))
        .single();
      
      if (error) throw error;
      
      // Crear un PDF simple con los datos
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte ${cotizacion.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e3a5f; }
            .info { margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>AutoPerito - Reporte de Cotización</h1>
          <div class="info">
            <p><span class="label">ID Cotización:</span> ${cotizacion.id}</p>
            <p><span class="label">Fecha:</span> ${new Date(cotizacion.creado_en).toLocaleString()}</p>
            <p><span class="label">Estado:</span> ${cotizacion.estado}</p>
            <p><span class="label">Observaciones:</span> ${cotizacion.observaciones || 'Ninguna'}</p>
            <p><span class="label">Valor Total:</span> $${parseFloat(cotizacion.monito_total || 0).toLocaleString()}</p>
          </div>
          <p style="margin-top: 50px; font-size: 12px; color: gray;">Documento generado por AutoPerito</p>
        </body>
        </html>
      `;
      
      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${cotizacionId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(' Error generando PDF:', error);
      alert('Error al generar el reporte');
    }
  }
};