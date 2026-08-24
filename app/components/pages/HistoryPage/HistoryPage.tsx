"use client";

import React, { useState, useMemo, useEffect } from "react";
import styles from "./HistoryPage.module.css";
import {
  FILTER_DEFAULT,
  ERROR_MESSAGES,
  LOCALE_CONFIG,
  ReportStatus,
} from "./History.constants";
import { historyService, Report } from "./History.service";

interface HistoryPageProps {
  userId?: string;
}

const formatDate = (date: Date) => ({
  day: date.getDate().toString(),
  month: date
    .toLocaleDateString(LOCALE_CONFIG.CODE, { month: "short" })
    .replace(".", "")
    .toUpperCase(),
});

const formatCurrency = (amount: number): string =>
  amount.toLocaleString(LOCALE_CONFIG.CODE);

const getStatusClass = (
  status: ReportStatus,
  stylesMap: Record<string, string>
): string => {
  switch (status) {
    case ReportStatus.WAITING:
      return stylesMap.statusWaiting || "";
    case ReportStatus.REPAIRED:
      return stylesMap.statusRepaired || "";
    case ReportStatus.CANCELLED:
      return stylesMap.statusCancelled || "";
    default:
      return stylesMap.statusWaiting || "";
  }
};

const HistoryPage = ({ userId = "1" }: HistoryPageProps): React.ReactElement => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>(FILTER_DEFAULT);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHistorial = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await historyService.getHistorial(userId);
        if (isMounted) setReports(data);
      } catch (err) {
        console.error("Error al cargar el historial:", err);
        if (isMounted) setError(ERROR_MESSAGES.LOAD_ERROR);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistorial();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleDownloadPDF = async (id: number) => {
    try {
      setDownloadingId(id);
      await historyService.downloadReportPdf(id, userId);
    } catch (err) {
      alert(err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_ERROR);
    } finally {
      setDownloadingId(null);
    }
  };

  const vehicleFilterOptions = useMemo(
    () => [FILTER_DEFAULT, ...Array.from(new Set(reports.map((r) => r.vehicle)))],
    [reports]
  );

  const filteredReports = useMemo(
    () => (filter === FILTER_DEFAULT ? reports : reports.filter((r) => r.vehicle === filter)),
    [filter, reports]
  );

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
        <p className={styles.subtitle}>
          Consulta y descarga tus valoraciones técnicas pasadas.
        </p>

        {reports.length > 0 && (
          <div className={styles.filterBar}>
            {vehicleFilterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`${styles.filterChip} ${
                  filter === option ? styles.active : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={styles.list}>
        {loading ? (
          <div className={styles.emptyState}>
            <p>Cargando historial...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{ERROR_MESSAGES.NO_REPORTS}</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const { day, month } = formatDate(report.date);
            const isDownloading = downloadingId === report.id;
            const statusStyleClass = getStatusClass(report.status, styles);

            return (
              <article key={report.id} className={styles.reportCard}>
                <div className={styles.dateBadge}>
                  <span className={styles.dayText}>{day}</span>
                  <span className={styles.monthText}>{month}</span>
                </div>

                <div className={styles.contentColumn}>
                  <h3 className={styles.reportTitle}>
                    {report.damage} - {report.vehicle}
                  </h3>
                  <div className={styles.detailsRow}>
                    <span className={styles.detailText}>
                      Placa: {report.plate}
                    </span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.detailText}>
                      Valor: ${formatCurrency(report.value)}
                    </span>
                  </div>
                </div>

                <div className={styles.actionsColumn}>
                  <span
                    className={`${styles.statusBadge} ${statusStyleClass}`}
                  >
                    {report.status}
                  </span>
                  <button
                    onClick={() => handleDownloadPDF(report.id)}
                    className={styles.pdfButton}
                    disabled={isDownloading}
                  >
                    {isDownloading ? "Descargando..." : "PDF"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
};

export default HistoryPage;