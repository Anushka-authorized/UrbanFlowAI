"use client";

import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  Polyline,
  Marker,
} from "react-leaflet";

import L from "leaflet";
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


  /* =====================================================
     LOAD SUMO NETWORK
  ===================================================== */

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


  /* =====================================================
     REDIRECT ARROW
  ===================================================== */

  const redirectIcon = L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #22c55e;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        font-weight: bold;
        box-shadow: 0 0 15px rgba(34,197,94,0.8);
      ">
        →
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });


  /* =====================================================
     MAIN + ALTERNATIVE ROUTES
  ===================================================== */

  const mainRoute: [number, number][] = [
  [21.1458, 79.0882],
  [21.1460, 79.0890],
  [21.1461, 79.0900],
  [21.1463, 79.0910],
  [21.1464, 79.0920],
  [21.1465, 79.0930],
  [21.1466, 79.0942],
  [21.1467, 79.0955],
  [21.1468, 79.0968],
  [21.1470, 79.0990],
];


 const alternativeRoute: [number, number][] = [
  [21.1458, 79.0882],
  [21.1450, 79.0890],
  [21.1445, 79.0900],
  [21.1438, 79.0910],
  [21.1430, 79.0920],
  [21.1422, 79.0930],
  [21.1415, 79.0940],
  [21.1405, 79.0960],
  [21.1395, 79.0980],
  [21.1390, 79.1010],
];


  const redirectPoint: [number, number] = [
    21.1438,
    79.0910,
  ];


  const alternativeDestination: [number, number] = [
    21.1390,
    79.1010,
  ];


  return (

    <div className="relative h-[500px] w-full overflow-hidden rounded-xl">

      <MapContainer
        center={[21.1458, 79.0882]}
        zoom={14}

        scrollWheelZoom={true}
        doubleClickZoom={false}
        touchZoom={true}
        zoomControl={true}

        minZoom={12}
        maxZoom={17}

        zoomAnimation={true}
        zoomAnimationThreshold={4}

        wheelDebounceTime={120}
        wheelPxPerZoomLevel={180}

        className="h-full w-full"
      >

        {/* =================================================
            OPEN STREET MAP
        ================================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =================================================
            SUMO ROAD NETWORK
        ================================================= */}

        {network && (

          <GeoJSON
            data={network}

            style={() => ({
              color: "#64748b",
              weight: 2,
              opacity: 0.45,
            })}

            onEachFeature={(feature, layer) => {

              const id =
                feature.properties?.id ??
                "Unknown Road";

              layer.bindTooltip(
                `SUMO Road: ${id}`,
                {
                  sticky: true,
                }
              );

            }}
          />

        )}


        {/* =================================================
            ORIGINAL / CONGESTED ROUTE
        ================================================= */}

        <Polyline
          positions={mainRoute}
          pathOptions={{
            color: "#ef4444",
            weight: 8,
            opacity: 0.95,
          }}
        >

          <Popup>

            <strong>
              🔴 Main Traffic Corridor
            </strong>

            <br />

            High traffic / congestion corridor

          </Popup>

        </Polyline>


        {/* =================================================
            ALTERNATIVE / REDIRECTED ROUTE
        ================================================= */}

        {optimized && (

          <Polyline
            positions={alternativeRoute}
            pathOptions={{
              color: "#22c55e",
              weight: 8,
              opacity: 0.95,
            }}
          >

            <Popup>

              <strong>
                🟢 Alternative Corridor
              </strong>

              <br />

              Recommended traffic redistribution route

              <br />

              🚗 {redirectedVehicles} vehicles/hour redirected

            </Popup>

          </Polyline>

        )}


        {/* =================================================
            MAIN ROUTE START
        ================================================= */}

        <CircleMarker
          center={mainRoute[0]}
          radius={10}

          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 1,
            weight: 3,
          }}
        >

          <Popup>

            <strong>
              🔴 Traffic Origin
            </strong>

            <br />

            Main corridor

          </Popup>

        </CircleMarker>


        {/* =================================================
            REDIRECTION POINT
        ================================================= */}

        {optimized && (

          <CircleMarker
            center={redirectPoint}
            radius={12}

            pathOptions={{
              color: "#facc15",
              fillColor: "#facc15",
              fillOpacity: 1,
              weight: 4,
            }}
          >

            <Popup>

              <strong>
                🔀 Redistribution Point
              </strong>

              <br />

              Traffic is redirected here

              <br />

              🚗 {redirectedVehicles} vehicles/hour

            </Popup>

          </CircleMarker>

        )}


        {/* =================================================
            REDIRECTION ARROW
        ================================================= */}

        {optimized && (

          <Marker
            position={redirectPoint}
            icon={redirectIcon}
          >

            <Popup>

              <strong>
                ➡️ Traffic Redirect
              </strong>

              <br />

              Vehicles are directed toward
              the alternative corridor.

            </Popup>

          </Marker>

        )}


        {/* =================================================
            ALTERNATIVE DESTINATION
        ================================================= */}

        {optimized && (

          <CircleMarker
            center={alternativeDestination}
            radius={10}

            pathOptions={{
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 1,
              weight: 3,
            }}
          >

            <Popup>

              <strong>
                🟢 Alternative Corridor
              </strong>

              <br />

              Recommended destination

            </Popup>

          </CircleMarker>

        )}

      </MapContainer>


      {/* =================================================
          LEGEND
      ================================================= */}

      <div className="absolute bottom-5 left-5 z-[1000] rounded-xl border border-slate-700 bg-slate-950/95 px-5 py-4 shadow-xl backdrop-blur">

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-400">
          Traffic Redistribution
        </p>


        <div className="space-y-2 text-xs text-white">

          <div className="flex items-center gap-2">

            <span className="h-3 w-8 rounded-full bg-red-500" />

            <span>
              Main / Congested Route
            </span>

          </div>


          <div className="flex items-center gap-2">

            <span className="h-3 w-8 rounded-full bg-green-500" />

            <span>
              Alternative Route
            </span>

          </div>


          {optimized && (

            <div className="flex items-center gap-2">

              <span className="text-lg text-green-400">
                →
              </span>

              <span>
                Traffic Redirect
              </span>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          STATUS CARD
      ================================================= */}

      <div className="absolute right-4 top-4 z-[1000] rounded-xl border border-slate-700 bg-slate-950/95 px-5 py-4 shadow-xl backdrop-blur">

        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          SUMO Network
        </p>


        <p className="mt-1 text-sm font-semibold text-white">

          {optimized
            ? "🟢 Traffic Optimized"
            : "🔴 Congestion Detected"}

        </p>


        {optimized && (

          <p className="mt-2 text-xs text-emerald-400">

            🚗 {redirectedVehicles} vehicles/hour
            redirected

          </p>

        )}

      </div>

    </div>

  );
}