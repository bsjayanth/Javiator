"use client";

import dynamic from "next/dynamic";

import AnalyticsDashboard from "./components/AnalyticsDashboard";

import {
  Truck,
  Package,
  Activity,
  BarChart3,
  Search,
  Bell,
  Moon,
  Sun,
  Fuel,
  Timer,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";

type FleetKpis = {
  total_vehicles: number;
  active_vehicles: number;
  moving_vehicles: number;
  low_fuel_vehicles: number;
};

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

const FleetMap = dynamic(
  () => import("./components/FleetMap"),
  {
    ssr: false,

    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-slate-400 bg-[#0F172A]">
        Loading Smart Fleet Map...
      </div>
    ),
  }
);

export default function Home() {

  const [darkMode, setDarkMode] =
    useState(true);

  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [kpis, setKpis] =
    useState<FleetKpis>({
      total_vehicles: 0,
      active_vehicles: 0,
      moving_vehicles: 0,
      low_fuel_vehicles: 0,
    });

  // 🔥 FETCH KPI DATA

  const fetchKpis = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/fleet/kpis/"
      );

      const data = await response.json();

      setKpis(data);

    } catch (error) {

      console.error(
        "KPI fetch error:",
        error
      );
    }
  };

  useEffect(() => {

    fetchKpis();

    const interval = setInterval(() => {

      fetchKpis();

    }, 5000);

    return () =>
      clearInterval(interval);

  }, []);

  return (

    <main
      className={`h-screen w-screen overflow-hidden flex ${
        darkMode
          ? "bg-[#071018] text-white"
          : "bg-[#F3F7FC] text-black"
      }`}
    >

      {/* SIDEBAR */}

      <div
        className={`w-[90px] border-r flex flex-col items-center py-8 gap-8 ${
          darkMode
            ? "bg-white/5 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >

        <div className="text-4xl">
          🚚
        </div>

        {[
          Truck,
          Package,
          Activity,
          BarChart3,
        ].map((Icon, index) => (

          <button
            key={index}
            className={`p-4 rounded-2xl transition-all hover:scale-110 ${
              index === 0
                ? "bg-[#00E5A8] text-black shadow-lg shadow-[#00E5A8]/30"
                : darkMode
                ? "bg-white/5 hover:bg-white/10"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >

            <Icon className="w-6 h-6" />

          </button>

        ))}

      </div>

      {/* MAIN */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}

        <div
          className={`h-[85px] border-b flex items-center justify-between px-8 ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >

          <div>

            <h1 className="text-5xl font-black tracking-tight">

              Javiator OS

            </h1>

            <p className="text-slate-400 text-sm mt-1">

              AI-Powered Logistics Intelligence Platform

            </p>

          </div>

          <div className="flex items-center gap-4">

            {/* SEARCH */}

            <div
              className={`w-[280px] flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >

              <Search className="w-4 h-4 text-slate-400" />

              <input
                placeholder="Search vehicles..."
                className="bg-transparent outline-none text-sm w-full"
              />

            </div>

            {/* THEME */}

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`p-3 rounded-2xl ${
                darkMode
                  ? "bg-white/5 border border-white/10"
                  : "bg-white border border-slate-200"
              }`}
            >

              {darkMode ? (

                <Sun className="w-5 h-5" />

              ) : (

                <Moon className="w-5 h-5" />

              )}

            </button>

            {/* ALERT */}

            <button className="bg-[#00E5A8] text-black p-3 rounded-2xl shadow-lg shadow-[#00E5A8]/30">

              <Bell className="w-5 h-5" />

            </button>

          </div>

        </div>

        {/* CONTENT */}

        <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">

          {/* LEFT */}

          <div className="col-span-9 flex flex-col gap-6 overflow-y-auto">

            {/* KPI */}

            <div className="grid grid-cols-4 gap-5">

              {[
                {
                  title: "Active Fleet",
                  value: kpis.active_vehicles,
                  icon: Truck,
                  color: "text-[#00E5A8]",
                },

                {
                  title: "Moving Vehicles",
                  value: kpis.moving_vehicles,
                  icon: Activity,
                  color: "text-blue-400",
                },

                {
                  title: "Total Vehicles",
                  value: kpis.total_vehicles,
                  icon: Package,
                  color: "text-yellow-400",
                },

                {
                  title: "Low Fuel Alerts",
                  value: kpis.low_fuel_vehicles,
                  icon: Fuel,
                  color: "text-red-400",
                },
              ].map((item, index) => {

                const Icon = item.icon;

                return (

                  <div
                    key={index}
                    className={`rounded-3xl p-6 border ${
                      darkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-slate-200"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-slate-400">

                          {item.title}

                        </p>

                        <h2 className="text-5xl font-black mt-3">

                          {item.value}

                        </h2>

                      </div>

                      <div
                        className={`p-4 rounded-2xl bg-black/20 ${item.color}`}
                      >

                        <Icon className="w-7 h-7" />

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* ANALYTICS */}

            <AnalyticsDashboard />

            {/* MAP */}

            <div
              className={`rounded-3xl overflow-hidden border min-h-[780px] ${
                darkMode
                  ? "border-white/10 bg-[#0F172A]"
                  : "border-slate-200 bg-white"
              }`}
            >

              <FleetMap
                selectedVehicle={
                  selectedVehicle
                }

                setSelectedVehicle={
                  setSelectedVehicle
                }
              />

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div
            className={`col-span-3 rounded-3xl border p-6 overflow-y-auto ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >

            <div className="space-y-6">

              <div>

                <h2 className="text-3xl font-black">

                  Live Dispatch

                </h2>

                <p className="text-slate-400 text-sm mt-1">

                  Real-time fleet intelligence feed

                </p>

              </div>

              {selectedVehicle ? (

                <div
                  className={`rounded-3xl p-6 border ${
                    darkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >

                  <div className="flex items-center gap-4 mb-6">

                    <div className="bg-[#00E5A8] text-black p-4 rounded-2xl">

                      <Truck className="w-7 h-7" />

                    </div>

                    <div>

                      <h3 className="text-2xl font-black">

                        {selectedVehicle.name}

                      </h3>

                      <p className="text-slate-400">

                        {selectedVehicle.vehicle_type}

                      </p>

                    </div>

                  </div>

                  <div className="space-y-4">

                    <div className="flex justify-between">

                      <span className="text-slate-400">

                        Driver

                      </span>

                      <span className="font-bold">

                        {selectedVehicle.driver_name}

                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-400">

                        Speed

                      </span>

                      <span className="font-bold">

                        {selectedVehicle.speed?.toFixed(
                          0
                        )} km/h

                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-400">

                        Fuel

                      </span>

                      <span className="font-bold text-green-400">

                        {selectedVehicle.fuel_level?.toFixed(
                          1
                        )}%

                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-400">

                        ETA

                      </span>

                      <span className="font-bold text-blue-400 flex items-center gap-2">

                        <Timer className="w-4 h-4" />

                        {selectedVehicle.eta_minutes?.toFixed(
                          1
                        )} mins

                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-400">

                        Remaining Distance

                      </span>

                      <span className="font-bold text-yellow-400 flex items-center gap-2">

                        <MapPinned className="w-4 h-4" />

                        {selectedVehicle.remaining_distance?.toFixed(
                          1
                        )} km

                      </span>

                    </div>

                  </div>

                  <div className="mt-8 rounded-2xl bg-[#00E5A8]/10 border border-[#00E5A8]/20 p-4 flex items-center gap-3">

                    <ShieldCheck className="w-5 h-5 text-[#00E5A8]" />

                    <p className="text-sm text-[#00E5A8]">

                      Vehicle operating normally

                    </p>

                  </div>

                </div>

              ) : (

                <div
                  className={`rounded-3xl p-8 border text-center ${
                    darkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >

                  <Truck className="w-12 h-12 mx-auto text-slate-500 mb-4" />

                  <p className="text-slate-400">

                    Select a vehicle from the map

                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}