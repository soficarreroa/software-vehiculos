"use client";

import ControlPanelPage from "@/app/components/pages/ControlPanelPage/ControlPanelPage";
import AdminDashboardPage from "@/app/components/pages/AdminDashboardPage/AdminDashboardPage";
import RoleRoute from "@/app/lib/auth/RoleRoute";
import { useMontado, useUsuarioSesion } from "@/app/lib/auth/session";

export default function Home() {
  const usuario = useUsuarioSesion();
  const montado = useMontado();

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
