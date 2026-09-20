"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Workshop } from "@/app/types/workshop";
import styles from "./workshopMap.module.css";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const BOGOTA_CENTER: [number, number] = [4.60971, -74.08175];
const DEFAULT_ZOOM = 12;
const SINGLE_WORKSHOP_ZOOM = 14;
const USER_COORDS_ZOOM = 13;

/**
 * Webpack/Turbopack pueden entregar el import de imagen como
 * StaticImageData (objeto con .src) o directamente como string con la
 * URL. El marcador de Leaflet necesita la URL final, así que se
 * normaliza a string en ambos casos.
 */
function urlDeImagen(mod: string | { src: string }): string {
  return typeof mod === "string" ? mod : mod.src;
}

// Los marcadores usan el icono por defecto de Leaflet, cuya URL apunta a
// rutas que no existen cuando la app se agrupa con un bundler moderno.
// Se reemplaza por las imágenes del propio paquete: se borra el detector
// por defecto y se fuerzan las URLs.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: urlDeImagen(markerIcon2xUrl),
  iconUrl: urlDeImagen(markerIconUrl),
  shadowUrl: urlDeImagen(markerShadowUrl),
});

interface UserCoords {
  lat: number;
  lng: number;
}

interface WorkshopMapProps {
  workshops: Workshop[];
  userCoords?: UserCoords | null;
}

function FitMap({ workshops, userCoords }: { workshops: Workshop[]; userCoords?: UserCoords | null }) {
  const map = useMap();

  useEffect(() => {
    if (userCoords) {
      map.setView([userCoords.lat, userCoords.lng], USER_COORDS_ZOOM);
      return;
    }

    if (workshops.length === 0) {
      map.setView(BOGOTA_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (workshops.length === 1) {
      map.setView([workshops[0].lat, workshops[0].lng], SINGLE_WORKSHOP_ZOOM);
      return;
    }

    const bounds = L.latLngBounds(workshops.map((w) => [w.lat, w.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: SINGLE_WORKSHOP_ZOOM });
  }, [workshops, userCoords, map]);

  return null;
}

export default function WorkshopMap({ workshops, userCoords }: WorkshopMapProps) {
  const validWorkshops = useMemo(
    () =>
      workshops.filter(
        (w) =>
          typeof w.lat === "number" &&
          typeof w.lng === "number" &&
          !Number.isNaN(w.lat) &&
          !Number.isNaN(w.lng)
      ),
    [workshops]
  );

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={BOGOTA_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
        scrollWheelZoom
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        />
        {validWorkshops.map((workshop) => (
          <Marker
            key={workshop.id}
            position={[workshop.lat, workshop.lng]}
          >
            <Popup>
              <span className={styles.popupCategory}>{workshop.categoria}</span>
              <div className={styles.popupName}>{workshop.nombre}</div>
              <div className={styles.popupAddress}>📍 {workshop.direccion}</div>
            </Popup>
          </Marker>
        ))}
        <FitMap workshops={validWorkshops} userCoords={userCoords} />
      </MapContainer>
    </div>
  );
}