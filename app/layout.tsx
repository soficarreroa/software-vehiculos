import type { Metadata, Viewport } from "next";
import Sidebar from "@/app/components/ui/Sidebar/Sidebar";

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
      <body>
        <Sidebar />
        <main className="layoutMain">
          {children}
        </main>
      </body>
    </html>
  );
}
