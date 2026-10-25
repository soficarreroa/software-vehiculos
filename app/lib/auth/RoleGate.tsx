"use client";

import { ReactNode } from "react";
import { useMontado, useUsuarioSesion } from "./session";

interface RoleGateProps {
  excludeRoles: string[];
  children: ReactNode;
}

export default function RoleGate({ excludeRoles, children }: RoleGateProps) {
  const usuario = useUsuarioSesion();
  const montado = useMontado();

  if (!montado) return null;
  if (!usuario || excludeRoles.includes(usuario.rol)) return null;

  return <>{children}</>;
}
