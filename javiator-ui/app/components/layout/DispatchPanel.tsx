"use client";

import ActivityFeed from "./ActivityFeed";

import AIinsights from "./AIinsights";

import {

  Truck,
  Timer,
  MapPinned,
  ShieldCheck,
  Fuel,
  Gauge,
  User,

} from "lucide-react";

type Vehicle = {

  id: number;

  name: string;

  vehicle_type: string;

  speed: number;

  fuel_level: number;

  driver_name: string;

  remaining_distance: number;

  eta_minutes: number;
};

type Props = {

  darkMode: boolean;

  selectedVehicle: Vehicle | null;
};

export default function DispatchPanel({

  darkMode,

  selectedVehicle,

}: Props) {

  return (

    <div
      className={`col-span-3 relative z-0 rounded-3xl border overflow-y-auto min-h-0 shadow-sm transition-colors duration-300 ${
        darkMode
          ? "bg-[#111111] border-white/[0.06]"
          : "bg-white border-[#E5E7EB]"
      }`}
    >

      <div className="p-5 lg:p-6 space-y-6">

        <div>

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2
                className={`text-[28px] lg:text-[32px] leading-none font-bold tracking-[-0.03em] ${
                  darkMode
                    ? "text-[#F5F5F5]"
                    : "text-[#111827]"
                }`}
              >

                Dispatch Hub

              </h2>

              <p
                className={`text-sm mt-2 ${
                  darkMode
                    ? "text-[#A1A1AA]"
                    : "text-[#6B7280]"
                }`}
              >

                Realtime fleet intelligence center

              </p>

            </div>

            <div className="flex items-center gap-2 shrink-0">

              <span className="relative flex h-2 w-2 rounded-full bg-rose-500/90">

                <span className="absolute inset-0 rounded-full bg-rose-500/60 animate-ping opacity-50" />

              </span>

              <span
                className={`text-[11px] font-semibold tracking-[0.14em] uppercase ${
                  darkMode
                    ? "text-[#D4D4D8]"
                    : "text-[#6B7280]"
                }`}
              >

                Live

              </span>

            </div>

          </div>

        </div>

        {selectedVehicle ? (

          <div
            className={`rounded-3xl border p-5 lg:p-6 transition-colors ${
              darkMode
                ? "bg-[#171717] border-white/[0.06]"
                : "bg-[#F8FAFC] border-[#E5E7EB]"
            }`}
          >

            <div
              className={`relative mb-6 h-36 w-full overflow-hidden rounded-2xl border ${
                darkMode
                  ? "border-white/[0.06] bg-gradient-to-br from-[#1F1F1F] via-[#141414] to-[#0A0A0A]"
                  : "border-[#E5E7EB] bg-gradient-to-br from-[#F3F4F6] via-[#ECEFF3] to-[#E5E7EB]"
              }`}
            >

              <div
                className={`absolute -right-4 bottom-[-18%] opacity-[0.12] ${
                  darkMode
                    ? "text-white"
                    : "text-[#111827]"
                }`}
              >

                <Truck
                  className="h-[130%] w-auto"
                  strokeWidth={1}
                />

              </div>

              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06),transparent_55%)]" />

            </div>

            <div className="flex items-start justify-between gap-4 mb-8">

              <div className="flex items-center gap-4 min-w-0">

                <div
                  className={`w-14 h-14 shrink-0 rounded-2xl border flex items-center justify-center ${
                    darkMode
                      ? "bg-[#111111] border-white/[0.06] text-[#D4D4D8]"
                      : "bg-white border-[#E5E7EB] text-[#374151]"
                  }`}
                >

                  <Truck className="w-6 h-6" />

                </div>

                <div className="min-w-0">

                  <h3
                    className={`text-[26px] font-bold tracking-tight leading-none truncate ${
                      darkMode
                        ? "text-[#F5F5F5]"
                        : "text-[#111827]"
                    }`}
                  >

                    {selectedVehicle.name}

                  </h3>

                  <p
                    className={`mt-2 text-sm capitalize ${
                      darkMode
                        ? "text-[#A1A1AA]"
                        : "text-[#6B7280]"
                    }`}
                  >

                    {selectedVehicle.vehicle_type}

                  </p>

                </div>

              </div>

              <div
                className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide ${
                  darkMode
                    ? "bg-[#111111] border-white/[0.08] text-[#E4E4E7]"
                    : "bg-white border-[#E5E7EB] text-[#374151]"
                }`}
              >

                Active

              </div>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <MetricCard
                darkMode={darkMode}
                icon={
                  <User className="w-4 h-4 text-[#9CA3AF]" />
                }
                label="Driver"
                value={selectedVehicle.driver_name}
              />

              <MetricCard
                darkMode={darkMode}
                icon={
                  <Gauge className="w-4 h-4 text-[#9CA3AF]" />
                }
                label="Speed"
                value={`${selectedVehicle.speed?.toFixed(
                  0
                )} km/h`}
              />

              <MetricCard
                darkMode={darkMode}
                icon={
                  <Fuel className="w-4 h-4 text-[#9CA3AF]" />
                }
                label="Fuel"
                value={`${selectedVehicle.fuel_level?.toFixed(
                  1
                )}%`}
              />

              <MetricCard
                darkMode={darkMode}
                icon={
                  <Timer className="w-4 h-4 text-[#9CA3AF]" />
                }
                label="ETA"
                value={`${selectedVehicle.eta_minutes?.toFixed(
                  1
                )} mins`}
              />

            </div>

            <div
              className={`mt-4 rounded-2xl p-5 border ${
                darkMode
                  ? "bg-[#111111] border-white/[0.06]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p
                    className={`text-xs uppercase tracking-wider font-medium ${
                      darkMode
                        ? "text-[#71717A]"
                        : "text-[#6B7280]"
                    }`}
                  >

                    Remaining distance

                  </p>

                  <h4
                    className={`text-2xl font-bold tracking-tight mt-2 ${
                      darkMode
                        ? "text-[#F5F5F5]"
                        : "text-[#111827]"
                    }`}
                  >

                    {selectedVehicle.remaining_distance?.toFixed(
                      1
                    )}{" "}
                    km

                  </h4>

                </div>

                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                    darkMode
                      ? "bg-[#171717] border-white/[0.06] text-[#A1A1AA]"
                      : "bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5563]"
                  }`}
                >

                  <MapPinned className="w-6 h-6" />

                </div>

              </div>

            </div>

            <div
              className={`mt-4 rounded-2xl border p-4 flex items-center gap-3 ${
                darkMode
                  ? "bg-[#111111] border-white/[0.06]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >

              <ShieldCheck
                className={`w-5 h-5 shrink-0 ${
                  darkMode
                    ? "text-[#A1A1AA]"
                    : "text-[#6B7280]"
                }`}
              />

              <p
                className={`text-sm leading-snug ${
                  darkMode
                    ? "text-[#D4D4D8]"
                    : "text-[#4B5563]"
                }`}
              >

                Vehicle operating normally

              </p>

            </div>

          </div>

        ) : (

          <div
            className={`rounded-3xl border p-10 text-center ${
              darkMode
                ? "bg-[#171717] border-white/[0.06]"
                : "bg-[#F8FAFC] border-[#E5E7EB]"
            }`}
          >

            <div
              className={`w-[72px] h-[72px] rounded-3xl border flex items-center justify-center mx-auto mb-5 ${
                darkMode
                  ? "bg-[#111111] border-white/[0.06] text-[#A1A1AA]"
                  : "bg-white border-[#E5E7EB] text-[#6B7280]"
              }`}
            >

              <Truck className="w-8 h-8" />

            </div>

            <h3
              className={`text-xl font-semibold ${
                darkMode
                  ? "text-[#F5F5F5]"
                  : "text-[#111827]"
              }`}
            >

              No vehicle selected

            </h3>

            <p
              className={`mt-3 text-sm leading-relaxed max-w-[260px] mx-auto ${
                darkMode
                  ? "text-[#A1A1AA]"
                  : "text-[#6B7280]"
              }`}
            >

              Select a live vehicle from the fleet map to view realtime
              telemetry and dispatch intelligence.

            </p>

          </div>

        )}

        <ActivityFeed
          darkMode={darkMode}
        />

        <AIinsights
          darkMode={darkMode}
        />

      </div>

    </div>
  );
}

type MetricCardProps = {

  darkMode: boolean;

  icon: React.ReactNode;

  label: string;

  value: string;
};

function MetricCard({

  darkMode,

  icon,

  label,

  value,

}: MetricCardProps) {

  return (

    <div
      className={`rounded-2xl p-4 border transition-colors ${
        darkMode
          ? "bg-[#111111] border-white/[0.06]"
          : "bg-white border-[#E5E7EB]"
      }`}
    >

      <div className="flex items-center gap-2 mb-3">

        {icon}

        <p
          className={`text-xs uppercase tracking-wider font-medium ${
            darkMode
              ? "text-[#71717A]"
              : "text-[#6B7280]"
          }`}
        >

          {label}

        </p>

      </div>

      <h4
        className={`text-sm font-semibold leading-snug line-clamp-2 ${
          darkMode
            ? "text-[#F5F5F5]"
            : "text-[#111827]"
        }`}
      >

        {value}

      </h4>

    </div>
  );
}
