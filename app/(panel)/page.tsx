"use client";

import ControlPanelPage from "@/app/components/pages/ControlPanelPage/ControlPanelPage";
import RoleRoute from "@/app/lib/auth/RoleRoute";

export default function Home() {
  return (
    <RoleRoute allowedRoles={["admin"]}>
      <ControlPanelPage />
    </RoleRoute>
  );
}