"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsuarioSesion, UsuarioSesion } from "./session";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const actual = getUsuarioSesion();
    setUsuario(actual);
    setMontado(true);

    if (actual && !allowedRoles.includes(actual.rol)) {
      router.replace("/no-autorizado");
    }
  }, [router, allowedRoles]);

  if (!montado) return null;
  if (!usuario || !allowedRoles.includes(usuario.rol)) return null;

  return <>{children}</>;
}