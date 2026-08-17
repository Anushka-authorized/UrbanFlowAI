"use client";

import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
} from "react-leaflet";

import type { FeatureCollection } from "geojson";

import "leaflet/dist/leaflet.css";

type MapViewProps = {
  optimized: boolean;
  redirectedVehicles: number;
};

export default function MapView({
  optimized,
  redirectedVehicles,
}: MapViewProps) {
  const [network, setNetwork] =
    useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/network.geojson")
      .then((response) => response.json())
      .then((data) => {
        setNetwork(data);
      })
      .catch((error) => {
        console.error(
          "Failed to load SUMO network:",
          error
        );
      });
  }, []);

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl">

      <MapContainer
        center={[21.1458, 79.0882]}
        zoom={14}

        /* Mouse wheel zoom */
        scrollWheelZoom={true}

        /* Prevent accidental double-click zoom */
        doubleClickZoom={false}

        /* Touch zoom */
        touchZoom={true}

        /* Zoom buttons */
        zoomControl={true}

        /* Prevent excessive zoom */
        minZoom={12}
        maxZoom={17}

        /* Keep zoom animation smooth */
        zoomAnimation={true}
        zoomAnimationThreshold={4}

        /* Smooth scrolling */
        wheelDebounceTime={120}
        wheelPxPerZoomLevel={180}

        className="h-full w-full"
      >

        {/* OpenStreetMap */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ACTUAL SUMO ROAD NETWORK */}

        {network && (
          <GeoJSON
            data={network}
            style={() => ({
              color: optimized
                ? "#22c55e"
                : "#38bdf8",

              weight: 4,
              opacity: 0.8,
            })}

            onEachFeature={(feature, layer) => {
              const id =
                feature.properties?.id ??
                "Unknown Road";

              layer.bindTooltip(
                `Road: ${id}`,
                {
                  sticky: true,
                }
              );
            }}
          />
        )}

        {/* MAIN TRAFFIC INDICATOR */}

        <CircleMarker
          center={[21.1458, 79.0882]}
          radius={11}
          pathOptions={{
            color: optimized
              ? "#22c55e"
              : "#ef4444",

            fillColor: optimized
              ? "#22c55e"
              : "#ef4444",

            fillOpacity: 0.9,
            weight: 3,
          }}
        >
          <Popup>
            <strong>
              Main Traffic Corridor
            </strong>

            <br />

            {optimized
              ? "🟢 Traffic optimized"
              : "🔴 Congestion detected"}
          </Popup>
        </CircleMarker>

        {/* ALTERNATIVE CORRIDOR */}

        {optimized && (
          <CircleMarker
            center={[21.1395, 79.098]}
            radius={10}
            pathOptions={{
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.9,
              weight: 3,
            }}
          >
            <Popup>
              <strong>
                Alternative Corridor
              </strong>

              <br />

              🟢 Recommended route

              <br />

              🚗 {redirectedVehicles} vehicles/hour
            </Popup>
          </CircleMarker>
        )}

      </MapContainer>

      {/* MAP STATUS */}

      <div className="absolute right-4 top-4 z-[1000] rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 shadow-lg backdrop-blur">

        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          SUMO Network
        </p>

        <p className="mt-1 text-sm font-semibold text-white">
          {optimized
            ? "🟢 Optimized"
            : "🔵 Simulation Network"}
        </p>

      </div>

    </div>
  );
}