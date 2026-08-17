"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl bg-slate-950 text-slate-400">
      Loading traffic map...
    </div>
  ),
});

type SimulationResults = {
  status: string;
  message: string;
  redirected_vehicles_per_hour: number;

  best_strategy: {
    redistribution_percent: number;
    travel_time: number;
    waiting_time: number;
    time_loss: number;
    score: number;
  };
  optimization_results: {
  redistribution_percent: number;
  avg_travel_time: number;
  avg_waiting_time: number;
  avg_time_loss: number;
  score: number;
  }[];

  before: {
    vehicles: number;
    avg_travel_time: number;
    avg_waiting_time: number;
    avg_time_loss: number;
  };

  after: {
    vehicles: number;
    avg_travel_time: number;
    avg_waiting_time: number;
    avg_time_loss: number;
  };
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState("");

  const runOptimization = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/optimize",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data: SimulationResults = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Optimization failed");
      }

      setResults(data);
    } catch (err) {
      console.error("Optimization error:", err);

      setError(
        "Unable to connect to UrbanFlow backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateImprovement = (
    before: number,
    after: number
  ) => {
    if (before === 0) {
      return 0;
    }

    return ((before - after) / before) * 100;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              🚦 Urban
              <span className="text-cyan-400">Flow</span>
            </h1>

            <p className="text-xs text-slate-500">
              Intelligent Traffic Optimization
            </p>
          </div>

          <div className="hidden gap-8 text-sm text-slate-400 md:flex">
            <span className="text-white">
              Dashboard
            </span>

            <span>
              Simulation
            </span>

            <span>
              Analytics
            </span>
          </div>

          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            ● System Ready
          </div>

        </div>
      </nav>

      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ================= HERO ================= */}

        <section className="mb-10">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Smart City Traffic Intelligence
          </p>

          <h2 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Smarter Traffic.
            <br />

            <span className="text-cyan-400">
              Better Flow.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            UrbanFlow simulates traffic conditions, detects
            overloaded routes and redistributes traffic toward
            available road capacity.
          </p>

        </section>

        {/* ================= CONTROL PANEL ================= */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Simulation Scenario
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Morning Peak Traffic
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Simulated high-demand traffic scenario
              </p>

            </div>

            <button
              onClick={runOptimization}
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "⚙ Running Simulation..."
                : "⚡ Optimize Traffic"}
            </button>

          </div>

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* ================= METRICS ================= */}

        <section className="grid gap-5 md:grid-cols-4">

          <Metric
            title="Vehicles Completed"
            value={
              results
                ? results.after.vehicles.toString()
                : "—"
            }
            icon="🚗"
          />

          <Metric
            title="Avg Travel Time"
            value={
              results
                ? `${results.after.avg_travel_time.toFixed(2)} sec`
                : "—"
            }
            icon="⏱️"
          />

          <Metric
            title="Waiting Time"
            value={
              results
                ? `${results.after.avg_waiting_time.toFixed(2)} sec`
                : "—"
            }
            icon="⌛"
          />

          <Metric
            title="Time Loss"
            value={
              results
                ? `${results.after.avg_time_loss.toFixed(2)} sec`
                : "—"
            }
            icon="📉"
          />

        </section>

        {/* ================= BEFORE / AFTER ================= */}

        {results && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Optimization Impact
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Before vs After UrbanFlow
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Real results generated from the SUMO traffic simulation.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <ComparisonCard
                title="Average Travel Time"
                before={results.before.avg_travel_time}
                after={results.after.avg_travel_time}
                unit=" sec"
              />

              <ComparisonCard
                title="Average Waiting Time"
                before={results.before.avg_waiting_time}
                after={results.after.avg_waiting_time}
                unit=" sec"
              />

              <ComparisonCard
                title="Average Time Loss"
                before={results.before.avg_time_loss}
                after={results.after.avg_time_loss}
                unit=" sec"
              />

            </div>

            {/* REDISTRIBUTION */}

            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Traffic Redistribution
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
                🚗 {results.redirected_vehicles_per_hour}

                <span className="ml-2 text-base font-normal text-slate-400">
                  vehicles/hour
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Traffic redistributed from the overloaded
                main corridor to an alternative route.
              </p>

            </div>

          </section>
        )}

        {/* ================= STRATEGY CHART ================= */}

{results && (
  <section className="mt-8">

    <OptimizationChart
      data={results.optimization_results}
    />

  </section>
)}

        {/* ================= TRAFFIC INTELLIGENCE ================= */}

        {results && (
          <TrafficStatus
            travelTime={results.best_strategy.travel_time}
            timeLoss={results.best_strategy.time_loss}
          />
        )}



        {/* ================= TRAFFIC MAP ================= */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Traffic Network
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                Live Simulation Map
              </h3>

            </div>

            <div className="flex flex-wrap gap-4 text-xs">

              <span className="text-red-400">
                ● Congested
              </span>

              <span className="text-emerald-400">
                ● Alternative
              </span>

              <span className="text-yellow-400">
                ● Junction
              </span>

            </div>

          </div>

          {/* ACTUAL LEAFLET MAP */}

          <MapView
            optimized={results !== null}
            redirectedVehicles={
              results?.redirected_vehicles_per_hour ?? 0
            }
          />

        </section>

        {/* ================= RECOMMENDATION ================= */}

        <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            UrbanFlow Recommendation
          </p>

          {!results ? (
            <>
              <h3 className="mt-3 text-xl font-semibold">
                ⚠️ Run the simulation to generate a recommendation
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                UrbanFlow will test multiple traffic redistribution
                strategies and select the best-performing strategy.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-3 text-2xl font-bold text-emerald-400">
                🏆 Best Traffic Strategy Found
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                UrbanFlow evaluated multiple traffic redistribution
                strategies through SUMO simulation and selected the
                strategy with the lowest overall traffic performance score.
              </p>

              {/* BEST STRATEGY */}

              <div className="mt-6 grid gap-4 md:grid-cols-4">

                <div className="rounded-xl border border-emerald-500/20 bg-slate-950 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Best Redistribution
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-400">
                    {results.best_strategy.redistribution_percent}%
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Redirected Traffic
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {results.redirected_vehicles_per_hour}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    vehicles/hour
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Best Travel Time
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {results.best_strategy.travel_time.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    seconds
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Optimization Score
                  </p>

                  <p className="mt-2 text-3xl font-bold text-cyan-400">
                    {results.best_strategy.score.toFixed(2)}
                  </p>

                </div>

              </div>

              {/* RECOMMENDED ACTION */}

              <div className="mt-6 rounded-xl border border-cyan-500/20 bg-slate-950 p-5">

                <p className="text-sm font-semibold text-cyan-400">
                  💡 Recommended Action
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Redirect approximately{" "}

                  <span className="font-bold text-emerald-400">
                    {results.redirected_vehicles_per_hour} vehicles/hour
                  </span>

                  {" "}from the overloaded main corridor toward
                  the alternative corridor.
                </p>

              </div>

            </>
          )}

        </section>

        {/* ================= FOOTER ================= */}

        <footer className="mt-12 border-t border-slate-800 py-8 text-center text-xs text-slate-500">

          UrbanFlow • AI-Assisted Traffic Optimization

          <span className="mx-2">
            •
          </span>

          SUMO + FastAPI + Next.js

        </footer>

      </div>

    </main>
  );
}


/* =========================================================
   METRIC COMPONENT
========================================================= */

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700">

      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   COMPARISON COMPONENT
========================================================= */
function OptimizationChart({
  data,
}: {
  data: SimulationResults["optimization_results"];
}) {
  const maxTime = Math.max(
    ...data.map((item) => item.avg_travel_time)
  );

  const best = Math.min(
    ...data.map((item) => item.avg_travel_time)
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Strategy Analysis
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          Redistribution Strategy Comparison
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          UrbanFlow tested multiple redistribution levels
          and selected the strategy with the lowest travel time.
        </p>
      </div>

      <div className="space-y-5">

        {data.map((item) => {

          const isBest =
            item.avg_travel_time === best;

          const width =
            (item.avg_travel_time / maxTime) * 100;

          return (
            <div key={item.redistribution_percent}>

              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span className="w-12 text-sm font-semibold">
                    {item.redistribution_percent}%
                  </span>

                  {isBest && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">
                      🏆 BEST
                    </span>
                  )}

                </div>

                <span className="text-sm font-semibold">
                  {item.avg_travel_time.toFixed(2)} sec
                </span>

              </div>


              <div className="h-4 overflow-hidden rounded-full bg-slate-800">

                <div
                  className={`h-full rounded-full transition-all ${
                    isBest
                      ? "bg-emerald-400"
                      : "bg-cyan-500"
                  }`}
                  style={{
                    width: `${width}%`,
                  }}
                />

              </div>


              <div className="mt-1 flex justify-between text-xs text-slate-500">

                <span>
                  Waiting: {item.avg_waiting_time.toFixed(2)} sec
                </span>

                <span>
                  Loss: {item.avg_time_loss.toFixed(2)} sec
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}



/* =========================================================
   TRAFFIC INTELLIGENCE
========================================================= */

function TrafficStatus({
  travelTime,
  timeLoss,
}: {
  travelTime: number;
  timeLoss: number;
}) {
  let status = "LOW";
  let message = "Traffic flow is operating efficiently.";
  let statusClass = "text-emerald-400";
  let bgClass = "border-emerald-500/20 bg-emerald-950/20";

  if (travelTime > 100 || timeLoss > 40) {
    status = "HIGH";
    message =
      "Heavy congestion detected. Traffic redistribution is recommended.";
    statusClass = "text-red-400";
    bgClass = "border-red-500/20 bg-red-950/20";
  } else if (travelTime > 80 || timeLoss > 25) {
    status = "MODERATE";
    message =
      "Moderate congestion detected. Optimization may improve traffic flow.";
    statusClass = "text-yellow-400";
    bgClass = "border-yellow-500/20 bg-yellow-950/20";
  }

  return (
    <div className={`mt-8 rounded-2xl border p-6 ${bgClass}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Traffic Intelligence
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            Current Traffic Status
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {message}
          </p>
        </div>

        <div className={`text-3xl font-bold ${statusClass}`}>
          ● {status}
        </div>
      </div>
    </div>
  );
}


function ComparisonCard({
  title,
  before,
  after,
  unit,
}: {
  title: string;
  before: number;
  after: number;
  unit: string;
}) {
  const improvement =
    before > 0
      ? ((before - after) / before) * 100
      : 0;

  const improved = improvement > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3">

        <div>

          <p className="text-[10px] font-semibold tracking-wider text-slate-600">
            BEFORE
          </p>

          <p className="mt-1 text-xl font-bold">
            {before.toFixed(2)}
            {unit}
          </p>

        </div>

        <div className="pb-1 text-xl text-slate-600">
          →
        </div>

        <div>

          <p className="text-[10px] font-semibold tracking-wider text-slate-600">
            AFTER
          </p>

          <p className="mt-1 text-xl font-bold">
            {after.toFixed(2)}
            {unit}
          </p>

        </div>

      </div>

      <div
        className={`mt-5 text-sm font-semibold ${
          improved
            ? "text-emerald-400"
            : improvement < 0
              ? "text-red-400"
              : "text-slate-500"
        }`}
      >
        {improvement === 0
          ? "No change"
          : (
            <>
              {improved ? "↓" : "↑"}{" "}
              {Math.abs(improvement).toFixed(1)}%
              {improved
                ? " improvement"
                : " increase"}
            </>
          )}
      </div>

    </div>
  );
}