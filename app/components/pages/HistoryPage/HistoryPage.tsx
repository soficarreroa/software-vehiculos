"use client";
import { useState, useMemo, useEffect } from 'react';
import styles from './HistoryPage.module.css';
import Card from '../../ui/Card/Card';
import Pill from '../../ui/Pill/Pill';
import { FILTER_DEFAULT, REPORT_STATUS, STATUS_PILL_COLOR, ReportStatus, ERROR_MESSAGES } from './History.constants';
import { historyService } from './History.service';

interface Report {
  id: number;
  vehicle: string;
  plate: string;
  date: Date;
  damage: string;
  value: number;
  status: ReportStatus;
}

const HistoryPage = (): React.ReactElement => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>(FILTER_DEFAULT);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await historyService.getHistorial("1");

        const formattedReports: Report[] = data.map((item: any) => {
          let mappedStatus: ReportStatus = REPORT_STATUS.WAITING;
          
          if (item.estado === 'Reparado') mappedStatus = REPORT_STATUS.REPAIRED;
          if (item.estado === 'Cancelado') mappedStatus = REPORT_STATUS.CANCELLED;

          return {
            id: Number(item.id),
            vehicle: item.vehiculo_nombre || 'Vehículo desconocido',
            plate: item.placa || '---',
            date: new Date(item.fecha),
            damage: item.descripcion_siniestro || 'Sin descripción',
            value: Number(item.valor_total || 0),
            status: mappedStatus,
          };
        });

        setReports(formattedReports);
      } catch (error) {
        console.error(ERROR_MESSAGES.LOAD_ERROR, error);
        setError(ERROR_MESSAGES.LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  const handleDescargarPDF = async (cotizacionId: number) => {
    try {
      await historyService.downloadReportPdf(cotizacionId, "2");
    } catch (error) {
      console.error(ERROR_MESSAGES.DOWNLOAD_ERROR, error);
      setError(ERROR_MESSAGES.DOWNLOAD_ERROR);
    }
  };

  const vehicleFilterOptions: string[] = useMemo(() => {
    const uniqueVehicles = Array.from(new Set(reports.map((report) => report.vehicle)));
    return [FILTER_DEFAULT, ...uniqueVehicles];
  }, [reports]);

  const filteredReports: Report[] = filter === FILTER_DEFAULT
    ? reports
    : reports.filter((report) => report.vehicle === filter);

  // Obtener día y mes por separado
  const getDay = (date: Date): string => {
    return date.getDate().toString();
  };

  const getMonth = (date: Date): string => {
    return date.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase().replace('.', '');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historial de Reportes</h1>
        <p className={styles.subtitle}>Consulta y descarga tus valoraciones técnicas pasadas.</p>

        {reports.length > 0 && (
          <div className={styles.filterBar}>
            {vehicleFilterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={filter === option ? styles.activeFilter : styles.filterBtn}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={styles.list}>
        {loading ? (
          <div className={styles.emptyState}><p>Cargando historial...</p></div>
        ) : reports.length === 0 ? (
          <div className={styles.emptyState}><p>{ERROR_MESSAGES.NO_REPORTS}</p></div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className={styles.reportCard}>
              <div className={styles.dateColumn}>
                <span className={styles.dayText}>{getDay(report.date)}</span>
                <span className={styles.monthText}>{getMonth(report.date)}</span>
              </div>
              <div className={styles.contentColumn}>
                <div className={styles.titleRow}>
                  <h3 className={styles.reportTitle}>{report.damage} - {report.vehicle}</h3>
                </div>
                <div className={styles.detailsRow}>
                  <span className={styles.plate}>Placa: {report.plate}</span>
                  <span className={styles.separator}>•</span>
                  <span className={styles.value}>Valor: ${report.value.toLocaleString()}</span>
                </div>
              </div>
              <div className={styles.actionsColumn}>
                <Pill color={STATUS_PILL_COLOR[report.status]}>
                  {report.status}
                </Pill>
                <button 
                  onClick={() => handleDescargarPDF(report.id)}
                  className={styles.pdfButton}
                >
                  PDF
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
