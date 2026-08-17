"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

type MapViewProps = {
  optimized: boolean;
  redirectedVehicles: number;
};

const mainRoute: [number, number][] = [
  [21.1458, 79.0882],
  [21.1468, 79.0940],
  [21.1478, 79.1000],
  [21.1488, 79.1060],
];

const alternativeRoute: [number, number][] = [
  [21.1458, 79.0882],
  [21.1425, 79.0940],
  [21.1395, 79.1000],
  [21.1370, 79.1060],
];

const intersections: [number, number][] = [
  [21.1458, 79.0882],
  [21.1468, 79.0940],
  [21.1478, 79.1000],
  [21.1488, 79.1060],
];

export default function MapView({
  optimized,
  redirectedVehicles,
}: MapViewProps) {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl">

       <MapContainer
        center={[21.1445, 79.097]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >


        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* MAIN ROUTE */}

        <Polyline
          positions={mainRoute}
          pathOptions={{
            color: optimized ? "#f97316" : "#ef4444",
            weight: 9,
            opacity: 0.9,
          }}
        />

        {/* ALTERNATIVE ROUTE */}

        <Polyline
          positions={alternativeRoute}
          pathOptions={{
            color: "#22c55e",
            weight: optimized ? 9 : 7,
            opacity: optimized ? 1 : 0.55,
            dashArray: optimized ? undefined : "12 10",
          }}
        />

        {/* JUNCTIONS */}

        {intersections.map((position, index) => (
          <CircleMarker
            key={index}
            center={position}
            radius={8}
            pathOptions={{
              color: "#facc15",
              fillColor: "#0f172a",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <strong>Junction {index + 1}</strong>
              <br />
              Traffic signal active
            </Popup>
          </CircleMarker>
        ))}

        {/* MAIN CORRIDOR */}

        <CircleMarker
          center={[21.1472, 79.097]}
          radius={10}
          pathOptions={{
            color: optimized ? "#f97316" : "#ef4444",
            fillColor: optimized ? "#f97316" : "#ef4444",
            fillOpacity: 0.85,
          }}
        >
          <Popup>
            <strong>Main Corridor</strong>
            <br />

            {optimized
              ? "🟠 Traffic reduced"
              : "🔴 High traffic"}

            <br />

            1800 vehicles/hour
          </Popup>
        </CircleMarker>

        {/* ALTERNATIVE CORRIDOR */}

        <CircleMarker
          center={[21.1408, 79.097]}
          radius={10}
          pathOptions={{
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: optimized ? 0.95 : 0.65,
          }}
        >
          <Popup>
            <strong>Alternative Corridor</strong>
            <br />

            {optimized
              ? "🟢 Recommended route"
              : "Available capacity"}

            <br />

            {optimized
              ? `${redirectedVehicles} vehicles redirected`
              : "150 vehicles/hour"}
          </Popup>
        </CircleMarker>

      </MapContainer>

      {/* OPTIMIZATION STATUS */}

      {optimized && (
        <div className="absolute right-4 top-4 z-[1000] rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-3 shadow-lg backdrop-blur">

          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Optimization Active
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            🚗 {redirectedVehicles}
          </p>

          <p className="text-xs text-slate-400">
            vehicles/hour redirected
          </p>

        </div>
      )}

    </div>
  );
}