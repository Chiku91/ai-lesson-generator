// components/visuals/MapRenderer.tsx
"use client";
import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function MapRenderer({ schema }: { schema?: any }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = require("leaflet");

    // Fix default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (!mapInstance.current && mapRef.current) {
      const pts = schema?.data_spec?.points ?? [];
      const center = pts.length > 0 ? [pts[0].lat, pts[0].lng] : [20.6, 78.9];
      mapInstance.current = L.map(mapRef.current).setView(center, schema?.layout?.zoom ?? 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);
      pts.forEach((p: any) => {
        L.marker([p.lat, p.lng]).addTo(mapInstance.current).bindPopup(p.label ?? "");
      });
    }
  }, [schema]);

  return (
    <div className="rounded overflow-hidden border" style={{ height: schema?.layout?.height ?? 360 }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
