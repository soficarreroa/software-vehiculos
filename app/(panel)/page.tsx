"use client";

import { useEffect, useState } from "react";
import ControlPanelPage from "@/app/components/pages/ControlPanelPage/ControlPanelPage";
import AdminDashboardPage from "@/app/components/pages/AdminDashboardPage/AdminDashboardPage";
import RoleRoute from "@/app/lib/auth/RoleRoute";
import { getUsuarioSesion, UsuarioSesion } from "@/app/lib/auth/session";

export default function Home() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setUsuario(getUsuarioSesion());
    setMontado(true);
  }, []);

  if (!montado) return null;

  if (usuario?.rol === "admin") {
    return (
      <RoleRoute allowedRoles={["admin"]}>
        <AdminDashboardPage />
      </RoleRoute>
    );
  }

  return (
    <RoleRoute allowedRoles={["cliente", "taller", "admin"]}>
      <ControlPanelPage />
    </RoleRoute>
  );
}