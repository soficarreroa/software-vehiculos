"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../ui/Card/Card";
import Info from "../../ui/Info/Info";
import Button from "../../ui/Button/Button";
import Pill from "../../ui/Pill/Pill";
import styles from "./controlPanelpage.module.css";
import { controlPanelPageOptions } from "@/lib/constants/controlPanel.constants";
import { getUsuarioSesion, UsuarioSesion } from "@/app/lib/auth/session";
import type { Workshop } from "@/app/types/workshop";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LIMITE_TALLERES_POR_USUARIO = 2;

const categoriaIconos: Record<string, string> = {
  "Mecánica general": "🔧",
  "Frenos": "⚙️",
  "Electricidad": "⚡",
  "Carrocería": "🚗",
  "Llantas": "🛞",
};

const ControlPanelPage = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [montado, setMontado] = useState(false);
  const [talleres, setTalleres] = useState<Workshop[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setUsuario(getUsuarioSesion());
    setMontado(true);
  }, []);

  useEffect(() => {
    if (usuario?.rol !== "taller") return;

    let activo = true;
    setCargando(true);

    fetch(`${API_BASE_URL}/api/v1/talleres`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!activo) return;
        const propios = (Array.isArray(data) ? data : []).filter(
          (taller: Workshop) => taller.propietario_id === usuario.auth_id
        );
        setTalleres(propios);
      })
      .catch((error) => {
        console.error("Error al cargar talleres:", error);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [usuario]);

  if (!montado) return null;

  if (usuario?.rol === "taller") {
    return (
      <main className={styles.main}>
        <div className={styles.headerMain}>
          <div>
            <h1 className={styles.title}>Panel de Taller Aliado</h1>
            <p className={styles.subtitle}>
              Gestiona tus talleres registrados en AutoPerito.
            </p>
          </div>
        </div>

        {cargando ? (
          <p className={styles.loadingText}>Cargando tus talleres...</p>
        ) : talleres.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🏪</span>
            <h2 className={styles.emptyTitle}>
              Aún no tienes talleres registrados
            </h2>
            <p className={styles.emptyText}>
              Registra tu primer taller para aparecer en la Red de Talleres
              Aliados de AutoPerito.
            </p>
          </div>
        ) : null}

        <div className={styles.gridOptions}>
          {talleres.map((taller) => (
            <Card
              key={taller.id}
              icon={categoriaIconos[taller.categoria] ?? "🏪"}
              title={taller.nombre}
              description={
                <>
                  <span className={styles.tallerCategoria}>
                    {taller.categoria}
                  </span>
                  <div className={styles.tallerEstado}>
                    {taller.verificado ? (
                      <Pill color="success">✅ Aprobado</Pill>
                    ) : (
                      <Pill color="warning">⏳ Pendiente de aprobación</Pill>
                    )}
                  </div>
                </>
              }
            />
          ))}

          {talleres.length < LIMITE_TALLERES_POR_USUARIO && (
            <Card
              icon="➕"
              title={
                talleres.length === 0
                  ? "Agregar tu primer taller"
                  : "Agregar otro taller"
              }
              description="Regístralo y aparecerá en la Red de Talleres Aliados de AutoPerito."
              onClick={() => router.push("/talleres-aliados")}
            />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <div>
          <h1 className={styles.title}>Panel de Control</h1>
          <p className={styles.subtitle}>
            Gestión integral de daños materiales
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <Pill>SOAT Vigente</Pill>
        </div>
      </div>

      <Info severity="error">
        <span>¿Necesitas ayuda inmediata en la vía?</span>
        <Button color="red">Llamar Asistencia</Button>
      </Info>

      <div className={styles.gridOptions}>
        {controlPanelPageOptions.map((option) => (
          <Card
            key={option.title}
            icon={option.icon}
            title={option.title}
            description={option.description}
          />
        ))}
      </div>
    </main>
  );
};

export default ControlPanelPage;