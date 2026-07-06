"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Driver = {
  id: string;
  name: string;
  phone: string;
  equipment: string;
  status: string;
  city: string;
  lat?: number;
  lng?: number;
  currentLoadId?: string;
  lastUpdateAt: string;
};

type FleetMapProps = {
  drivers: Driver[];
  selectedDriver?: string;
  onDriverSelect?: (driverId: string) => void;
};

const statusColors: Record<string, string> = {
  AVAILABLE: "#22c55e",
  EN_ROUTE: "#3b82f6",
  AT_PICKUP: "#f59e0b",
  AT_DROPOFF: "#8b5cf6",
  DELAYED: "#ef4444",
  BREAKDOWN: "#ef4444",
  OFF_DUTy: "#6b7280",
};

export function FleetMap({ drivers, selectedDriver, onDriverSelect }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [49.2827, -123.1207],
      zoom: 6,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    drivers.forEach((driver) => {
      if (typeof driver.lat !== "number" || typeof driver.lng !== "number") return;

      const color = statusColors[driver.status] || "#6b7280";
      const isSelected = driver.id === selectedDriver;

      const icon = L.divIcon({
        className: "fleet-marker",
        html: `
          <div style="
            width: ${isSelected ? "20px" : "14px"};
            height: ${isSelected ? "20px" : "14px"};
            background: ${color};
            border-radius: 50%;
            border: ${isSelected ? "3px solid white" : "2px solid white"};
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transition: all 0.2s;
          "></div>
        `,
        iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
        iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
      });

      let marker = markersRef.current.get(driver.id);
      if (marker) {
        marker.setLatLng([driver.lat, driver.lng]);
        marker.setIcon(icon);
      } else {
        marker = L.marker([driver.lat, driver.lng], { icon }).addTo(map);
        marker.on("click", () => onDriverSelect?.(driver.id));

        marker.bindPopup(`
          <div style="font-family: system-ui; min-width: 180px;">
            <p style="font-weight: 600; margin: 0 0 4px;">${driver.name}</p>
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px;">${driver.status} • ${driver.city}</p>
            <p style="color: #6b7280; font-size: 11px; margin: 0;">${driver.equipment}</p>
            ${driver.currentLoadId ? `<p style="color: #3b82f6; font-size: 11px; margin: 4px 0 0;">Load: ${driver.currentLoadId}</p>` : ""}
          </div>
        `);
        markersRef.current.set(driver.id, marker);
      }
    });

    const bounds = drivers
      .filter((d) => typeof d.lat === "number" && typeof d.lng === "number")
      .map((d) => [d.lat!, d.lng!] as [number, number]);

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [drivers, selectedDriver, onDriverSelect]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
}
