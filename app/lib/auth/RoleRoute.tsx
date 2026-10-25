"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMontado, useUsuarioSesion } from "./session";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const router = useRouter();
  const usuario = useUsuarioSesion();
  const montado = useMontado();
  const sinPermiso = !!usuario && !allowedRoles.includes(usuario.rol);

  useEffect(() => {
    if (sinPermiso) router.replace("/no-autorizado");
  }, [sinPermiso, router]);

  if (!montado) return null;
  if (!usuario || sinPermiso) return null;

  return <>{children}</>;
}
