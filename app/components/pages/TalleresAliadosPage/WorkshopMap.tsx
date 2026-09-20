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

const DEFAULT_MARKER_ICON = L.icon({
  iconUrl: markerIconUrl.src,
  iconRetinaUrl: markerIcon2xUrl.src,
  shadowUrl: markerShadowUrl.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validWorkshops.map((workshop) => (
          <Marker
            key={workshop.id}
            position={[workshop.lat, workshop.lng]}
            icon={DEFAULT_MARKER_ICON}
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