"use client";

import { ReactNode, useEffect, useState } from "react";
import { getUsuarioSesion, UsuarioSesion } from "./session";

interface RoleGateProps {
  excludeRoles: string[];
  children: ReactNode;
}

export default function RoleGate({ excludeRoles, children }: RoleGateProps) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setUsuario(getUsuarioSesion());
    setMontado(true);
  }, []);

  if (!montado) return null;
  if (!usuario || excludeRoles.includes(usuario.rol)) return null;

  return <>{children}</>;
}