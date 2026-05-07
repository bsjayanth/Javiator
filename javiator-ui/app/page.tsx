"use client";

import dynamic from "next/dynamic";

import {
  Truck,
  Package,
  Activity,
  BarChart3,
  Search,
  Bell,
  Moon,
  Sun
} from "lucide-react";

import { useState, useEffect } from "react";

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
};

const FleetMap = dynamic(
  () => import("./components/FleetMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-slate-400 bg-[#0F172A]">
        Loading Map...
      </div>
    ),
  }
);

export default function Home() {

  const [darkMode, setDarkMode] = useState(true);

  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [kpis, setKpis] = useState<FleetKpis>({
    total_vehicles: 0,
    active_vehicles: 0,
    moving_vehicles: 0,
    low_fuel_vehicles: 0,
  });

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

    return () => clearInterval(interval);

  }, []);

  return (

    <main
      className={`h-screen w-screen overflow-hidden flex transition-all duration-300 ${
        darkMode
          ? "bg-[#0B1220] text-white"
          : "bg-[#F4F7FB] text-black"
      }`}
    >

      {/* SIDEBAR */}

      <div
        className={`w-[90px] backdrop-blur-2xl border-r flex flex-col items-center py-6 gap-8 transition-all duration-300 ${
          darkMode
            ? "bg-white/5 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >

        <div className="text-3xl font-bold">
          🚚
        </div>

        <button
          className={`p-3 rounded-2xl border transition ${
            darkMode
              ? "bg-[#00E5A8]/10 border-[#00E5A8]/20"
              : "bg-[#00E5A8]/20 border-[#00E5A8]/30"
          }`}
        >
          <Truck className="w-6 h-6 text-[#00E5A8]" />
        </button>

        <button className="p-3 rounded-2xl hover:bg-black/5 transition">
          <Package className="w-6 h-6 text-slate-400" />
        </button>

        <button className="p-3 rounded-2xl hover:bg-black/5 transition">
          <Activity className="w-6 h-6 text-slate-400" />
        </button>

        <button className="p-3 rounded-2xl hover:bg-black/5 transition">
          <BarChart3 className="w-6 h-6 text-slate-400" />
        </button>

      </div>

      {/* MAIN */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}

        <div
          className={`h-[80px] border-b backdrop-blur-xl flex items-center justify-between px-8 shrink-0 transition-all duration-300 ${
            darkMode
              ? "border-white/10 bg-white/5"
              : "border-slate-200 bg-white/70"
          }`}
        >

          <div>

            <h1 className="text-4xl font-bold tracking-tight">
              Javiator OS
            </h1>

            <p
              className={`text-sm mt-1 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Intelligent Logistics Operating System
            </p>

          </div>

          <div className="flex items-center gap-4">

            {/* SEARCH */}

            <div
              className={`rounded-2xl px-4 py-2 flex items-center gap-2 w-[260px] border transition-all ${
                darkMode
                  ? "bg-white/10 border-white/10"
                  : "bg-white border-slate-300"
              }`}
            >

              <Search className="w-4 h-4 text-slate-400" />

              <input
                placeholder="Search vehicles..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
              />

            </div>

            {/* THEME TOGGLE */}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-2xl border transition-all ${
                darkMode
                  ? "bg-white/10 border-white/10"
                  : "bg-white border-slate-300"
              }`}
            >

              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}

            </button>

            {/* NOTIFICATION */}

            <button className="bg-[#00E5A8] hover:scale-105 transition text-black p-3 rounded-2xl">

              <Bell className="w-5 h-5" />

            </button>

          </div>

        </div>

        {/* DASHBOARD */}

        <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">

          {/* LEFT SECTION */}

          <div className="col-span-9 flex flex-col gap-6 overflow-hidden">

            {/* KPI */}

            <div className="grid grid-cols-3 gap-6 shrink-0">

              {[
                {
                  title: "Active Vehicles",
                  value: kpis.active_vehicles
                },
                {
                  title: "Moving Vehicles",
                  value: kpis.moving_vehicles
                },
                {
                  title: "Total Vehicles",
                  value: kpis.total_vehicles
                }
              ].map((item, index) => (

                <div
                  key={index}
                  className={`backdrop-blur-xl rounded-3xl p-6 shadow-lg border transition-all duration-300 ${
                    darkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >

                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {item.title}
                  </p>

                  <h2 className="text-5xl font-bold mt-3">
                    {item.value}
                  </h2>

                </div>

              ))}

            </div>

            {/* MAP */}

            <div
              className={`flex-1 min-h-[700px] rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
                darkMode
                  ? "border-white/10 bg-[#0F172A]"
                  : "border-slate-200 bg-white"
              }`}
            >

              <FleetMap
                setSelectedVehicle={setSelectedVehicle}
              />

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div
            className={`col-span-3 backdrop-blur-xl rounded-3xl p-6 flex flex-col overflow-hidden border transition-all duration-300 ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >

            <div className="space-y-4">

              <h2 className="text-2xl font-bold">
                Live Dispatch Feed
              </h2>

              {selectedVehicle ? (

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">

                  <h3 className="text-2xl font-bold mb-4">
                    🚚 {selectedVehicle.name}
                  </h3>

                  <div className="space-y-3 text-lg">

                    <p>
                      Driver:
                      <span className="font-semibold ml-2">
                        {selectedVehicle.driver_name}
                      </span>
                    </p>

                    <p>
                      Type:
                      <span className="font-semibold ml-2">
                        {selectedVehicle.vehicle_type}
                      </span>
                    </p>

                    <p>
                      Speed:
                      <span className="font-semibold ml-2">
                        {selectedVehicle.speed} km/h
                      </span>
                    </p>

                    <p>
                      Fuel:
                      <span className="font-semibold ml-2">
                        {selectedVehicle.fuel_level}%
                      </span>
                    </p>

                  </div>

                </div>

              ) : (

                <div className="text-gray-400">

                  Select a vehicle from map

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}