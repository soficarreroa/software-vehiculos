import type { Metadata, Viewport } from "next";

import "./styles/theme.css";
import "./styles/styles.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AutoPerito",
  description: "Sistema de gestión de vehículos y cotizaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}